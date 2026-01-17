import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Invoice from '../models/invoice.js';
import mongoose from "mongoose";
import PDFDocument from 'pdfkit';
import archiver from "archiver";
import { generateInvoicePDF } from '../utils/invoicePdf.js';

import { companyData } from '../config/config.js';

// POST /api/invoices
export const createInvoice = async (req, res, next) => {
  try {
    const payload = req.body;
    // validar mínimamente
    if (!payload.client || !payload.lines?.length) {
      return res.status(400).json({ message: "Cliente y líneas obligatorias" });
    }

    // mirar si puedo usar y  validar cada campo con Joi/Yup. Aquí creo y mongoose hará hook de pre-validate.
    const invoice = new Invoice({
      ...payload,
      createdBy: req.user._id
    });

    await invoice.save();
    res.status(201).json({ invoice });
  } catch (err) {
    next(err);
  }
};



// POST /api/invoices/preview
export const previewInvoice = async (req, res, next) => {
  try {
    const {
      client,
      lines,
      ivaPercent = 21,
      irpfPercent = 0,
      ivaIncluido = false
    } = req.body;

    if (!client || !lines?.length) {
      return res.status(400).json({ message: 'Cliente y líneas obligatorias' });
    }

    // Calcular líneas con totales
    const linesWithTotal = lines.map(l => ({
      ...l,
      lineTotal: l.qty * l.unitPrice
    }));

    // ===============================
    // 💰 Calcular base según si el IVA está incluido
    // ===============================
    let base;
    if (ivaIncluido && ivaPercent > 0) {
      base = linesWithTotal.reduce(
        (sum, l) => sum + (l.unitPrice / (1 + ivaPercent / 100)) * l.qty,
        0
      );
    } else {
      base = linesWithTotal.reduce((sum, l) => sum + l.lineTotal, 0);
    }
    base = +base.toFixed(2);

    const ivaAmount = +(base * (ivaPercent / 100)).toFixed(2);
    const irpfAmount = +(base * (irpfPercent / 100)).toFixed(2);

    // 💡 Si el IVA está incluido, el total ya lo contiene
    const total = ivaIncluido
      ? +(base - irpfAmount + ivaAmount).toFixed(2)
      : +(base + ivaAmount - irpfAmount).toFixed(2);

    res.json({
      preview: {
        client,
        lines: linesWithTotal,
        base,
        ivaAmount,
        irpfAmount,
        total,
        ivaPercent,
        ivaIncluido
      }
    });
  } catch (err) {
    next(err);
  }
};





// GET /api/invoices
export const listInvoices = async (req, res, next) => {
  try {
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = req.query.sort === "asc" ? 1 : -1; // 🔹 soporte para ordenar
    const statusFilter = req.query.status; // 🔹 soporte para filtrar por estado

    const query = { deletedAt: null };
    if (statusFilter) {
      query.status = statusFilter;
    }

    const docs = await Invoice.find(query)
      .sort({ date: sortOrder })
      .skip(skip)
      .limit(limitNum);
    const total = await Invoice.countDocuments(query);
    res.json({ data: docs, total });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/:id
export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

// POST /api/invoices/:id/issue
export const issueInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });
    if (invoice.status !== 'draft')
      return res.status(400).json({ message: 'Solo se pueden emitir borradores' });

     // ✅ Si vienen datos en el body (ej. cambios desde el editor), actualíza antes de emitir
    const allowed = [
      'client',
      'lines',
      'ivaPercent',
      'irpfPercent',
      'ivaIncluido',
      'paymentMethod',
      'iban',
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) invoice[k] = req.body[k];
    });

    invoice.status = 'issued';
    invoice.issuedBy = req.user._id;
    invoice.date = new Date(); // Fecha de emisión

    await invoice.save(); // esto disparará el hook para numerar
    res.json({ message: 'Factura emitida correctamente', invoice });
  } catch (err) {
    next(err);
  }
};


// POST /api/invoices/:id/cancel
export const cancelInvoice = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });
    if (invoice.status !== 'issued')
      return res.status(400).json({ message: 'Solo se pueden anular facturas emitidas' });
    if (!reason) return res.status(400).json({ message: 'Motivo de anulación requerido' });

    invoice.status = 'cancelled';
    invoice.cancelDate = new Date();
    invoice.cancelReason = reason;
    await invoice.save();

    res.json({ message: 'Factura anulada correctamente', invoice });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/invoices/:id/rectify
 * Genera factura rectificativa R-..., marca original como rectified y asocia rectifies.
 * Body: { reason, lines? (override), client? (override) }
 */
export const rectifyInvoice = async (req, res, next) => {
  try {
    const original = await Invoice.findById(req.params.id);
    if (!original)
       return res.status(404).json({ message: "Factura original no encontrada" });
    
    // 🔹 Permitimos rectificar facturas emitidas o anuladas
    if (!["issued", "cancelled"].includes(original.status)) {
      return res
        .status(400)
        .json({ message: "Solo se pueden rectificar facturas emitidas o anuladas" });
    }

    const { reason, lines = original.lines, client = original.client } = req.body;
    if (!reason)
       return res.status(400).json({ message: "Motivo de rectificación requerido" });

    // marcar original como rectified
    original.status = "rectified";
    original.rectifyReason = reason
    await original.save();

    // 🔸 marcar original como rectificada
    original.status = "rectified";
    await original.save();

    // 🔹 crear nueva factura rectificativa (como borrador para poder editar)
    const rect = new Invoice({
      client,
      lines,
      ivaPercent: original.ivaPercent,
      irpfPercent: original.irpfPercent,
      ivaIncluido: original.ivaIncluido,
      status: "draft", // 👈 IMPORTANTE: borrador editable
      rectifies: original.number, // 👈 referencia a la original
      createdBy: req.user._id,
    });

    rect.rectifyReason = reason;
    await rect.save();

    res.json({
      message: "Factura rectificativa creada como borrador editable",
      rect,
      original,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/invoices/:id actualizar borrador
export const updateInvoiceDraft = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });
    if (invoice.status !== 'draft')
      return res.status(400).json({ message: 'Solo se pueden editar borradores' });

    // solo asigna los campos permitidos
    const allowed = ["client", "lines", "ivaPercent", "irpfPercent", "ivaIncluido", "paymentMethod", "iban"];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) invoice[k] = req.body[k];
    });
    await invoice.save();
    res.json({ message: 'Borrador actualizado', invoice });
  } catch (err) {
    next(err);
  }
};


// GET /api/invoices/:id/pdf  -> PDF con pdfkit

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).lean();
    if (!invoice) return res.status(404).json({ message: 'Factura no encontrada' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${`${invoice.number}_${invoice.client.name}` || 'factura'}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Capturar errores del stream
    doc.on('error', (err) => {
      console.error('Error generando PDF:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Error generando PDF' });
    });

    doc.pipe(res);

    // ======================
    // 🧾 ENCABEZADO
    // ======================
    const logoPath = path.join(__dirname, '../public/img/logo-pedro.jpg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 100 });
    }

    doc.font('Helvetica-Bold').fontSize(20).text(companyData.name, 170, 50);
    doc.font('Helvetica').fontSize(11)
      .text(companyData.address, 170, 75)
      .text(`NIF: ${companyData.nif}`, 170, 90)
      .text(`Teléfono: ${companyData.phone || 'N/A'}`, 170, 105)
      .text(`Email: ${companyData.email || 'N/A'}`, 170, 120);

    // Más aire visual arriba
    doc.moveDown(3);

    
    // ======================
    // 📅 DATOS DE FACTURA
    // ======================
   doc.font('Helvetica-Bold').fontSize(13).text(invoice.number ? `Factura` : 'Presupuesto ', 50, 160);
   // doc.font('Helvetica-Bold').fontSize(13).text('Factura', 50, 160);
    doc.font('Helvetica').fontSize(11)
        .text(invoice.number ? `Factura Nº: ${invoice.number}` : ' ', 50, 180)
      //.text(`Factura Nº: ${invoice.number}` , 50, 180)
      .text(`Fecha: ${new Date(invoice.date).toLocaleDateString()}`, 50, 195);

    // ======================
    // 👤 CUADRO CLIENTE
    // ======================
    const clientBoxY = 230;
    doc.roundedRect(50, clientBoxY, 500, 110, 8).stroke('#333');

    doc.font('Helvetica-Bold').fontSize(12).text('Cliente:', 60, clientBoxY + 10);
    doc.font('Helvetica').fontSize(11)
      .text(`Nombre: ${invoice.client.name}`, 60, clientBoxY + 30)
      .text(`Dirección: ${invoice.client.address || 'N/A'}`, 60, clientBoxY + 45)
      .text(`NIF: ${invoice.client.nif || 'N/A'}`, 60, clientBoxY + 60)
      .text(`Teléfono: ${invoice.client.phone || 'N/A'}`, 60, clientBoxY + 75)
      .text(`Email: ${invoice.client.email || 'N/A'}`, 60, clientBoxY + 90);


    // ======================
    // 📋 TABLA DE CONCEPTOS
    // ======================
    let y = clientBoxY + 130;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Cabecera de la tabla
    doc.font('Helvetica-Bold');
    doc.text('Descripción', 60, y);
    doc.text('Cantidad', 300, y, { width: 80, align: 'center' });
    doc.text('Precio', 390, y, { width: 70, align: 'center' });
    doc.text('Total', 470, y, { width: 70, align: 'right' });

    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();

    // Filas de productos
    // Filas de productos
    doc.font('Helvetica');
    invoice.lines.forEach((l) => {
      // 👇 comprobamos si nos pasamos del límite de página
      if (y > 600) {
        doc.addPage();
        y = 50; // reiniciamos coordenada Y en la nueva página

        // reimprimir cabecera de la tabla en la nueva página
        doc.font('Helvetica-Bold');
        doc.text('Descripción', 60, y);
        doc.text('Cantidad', 300, y, { width: 80, align: 'center' });
        doc.text('Precio', 390, y, { width: 70, align: 'center' });
        doc.text('Total', 470, y, { width: 70, align: 'right' });

        y += 20;
        doc.moveTo(50, y).lineTo(550, y).stroke();
      }

      // ahora pintamos la línea normal
      y += 25;
      doc.font('Helvetica');
      doc.text(l.description, 60, y);
      doc.text(l.qty.toString(), 300, y, { width: 80, align: 'center' });
      doc.text(`${l.unitPrice.toFixed(2)} €`, 390, y, { width: 70, align: 'center' });
      doc.text(`${l.lineTotal.toFixed(2)} €`, 470, y, { width: 70, align: 'right' });
    });


    // ======================
    // 💶 TOTALES
    // ======================
    y += 30;

    // Cuadro totales con fondo suave
    doc.roundedRect(320, y - 10, 230, 100, 6).fillAndStroke('#f8f8f8', '#ccc');
    doc.fillColor('#000');

    doc.font('Helvetica-Bold').fontSize(11)
      .text('Base imponible:', 340, y, { align: 'left' });
    doc.font('Helvetica').text(`€${invoice.base.toFixed(2)}`, 480, y, { align: 'right' });

    y += 20;

    // 💡 Mostrar IVA según si está incluido o no
    let ivaLabel;
    if (invoice.ivaIncluido) {
      ivaLabel = `IVA (${invoice.ivaPercent}%, incluido):`;
    } else {
      ivaLabel = `IVA (${invoice.ivaPercent}%):`;
    }

    doc.font('Helvetica-Bold').text(ivaLabel, 340, y, { align: 'left' });
    doc.font('Helvetica').text(`€${invoice.ivaAmount.toFixed(2)}`, 480, y, { align: 'right' });



    if (invoice.irpfPercent) {
      y += 20;
      doc.font('Helvetica-Bold').text(`IRPF (${invoice.irpfPercent}%):`, 340, y);
      doc.font('Helvetica').text(`-€${invoice.irpfAmount.toFixed(2)}`, 480, y, { align: 'right' });
    }

    // 💰 Total destacado
    y += 25;
    doc.font('Helvetica-Bold').fontSize(13);
    doc.text('TOTAL:', 340, y, { align: 'left' });
    doc.text(`€${invoice.total.toFixed(2)}`, 480, y, { align: 'right' });
    doc.moveDown();

    // ======================
    // 🖋️ PIE DE PÁGINA
    // ======================
    doc.fontSize(10).fillColor('#555').font('Helvetica-Oblique')
      .text('Gracias por su confianza.', 50, 750, { align: 'center', width: 500 });

    // si cancelled -> marca de agua y motivo
    if (invoice.status === "cancelled") {
      // marca diagonal grande
      const watermarkText = "ANULADA";
      doc.fontSize(60);
      doc.fillColor("rgba(200,0,0,0.15)");
      doc.rotate(-30, { origin: [300, 400] });
      doc.text(watermarkText, 80, 330, { align: "center", width: 400 });
      doc.rotate(30, { origin: [300, 400] });
      doc.fillColor("#000");
      // motivo y fecha en pie
      doc.fontSize(9).text(`Motivo: ${invoice.cancelReason || "—"}`, 50, 770, { align: "center", width: 500 });
      doc.text(`Fecha anulación: ${invoice.cancelDate ? new Date(invoice.cancelDate).toLocaleDateString() : "—"}`, 50, 785, { align: "center", width: 500 });
    }

    /// 🧾 Relación entre facturas rectificadas / rectificativas
if (invoice.rectifies) {
  // Esta factura es una rectificativa (R-2025-XXX)
  doc.moveDown(0.2);
  doc
    .fontSize(9)
    .fillColor("#444")
    .font("Helvetica-Oblique")
    .text(`Rectifica a: ${invoice.rectifies}`, 50, 770, {
      align: "center",
      width: 500,
    });
} else if (invoice.status === "rectified" && invoice.rectifyReason) {
  // Esta factura fue rectificada por otra
  doc.moveDown(0.2);
  doc
    .fontSize(9)
    .fillColor("#a00")
    .font("Helvetica-Oblique")
    .text(`Factura rectificada. Motivo: ${invoice.rectifyReason}`, 50, 770, {
      align: "center",
      width: 500,
    });
}




    doc.end();
  } catch (err) {
    next(err);
  }
};

// DELETE /api/invoices/:id -> soft delete
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice)
      return res.status(404).json({ message: "Factura no encontrada" });
    if (invoice.status !== "draft")
      return res
        .status(403)
        .json({ message: "Solo se pueden eliminar borradores" });
    invoice.deletedAt = new Date();
    await invoice.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};



// GET /api/invoices/stats //sirve para ver las estadisticas de cuantas facturas hay y el total acumulado
export const statsInvoices = async (req, res, next) => {
  try {
    const totalCount = await Invoice.countDocuments({ deletedAt: null,
    status: { $in: ["issued"] }, // 🔹 solo emitidas 
    });
    const totalAmount = await Invoice.aggregate([
      { $match: { deletedAt: null, status: { $in: ["issued"] }, }, },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      totalInvoices: totalCount,
      totalAmount: totalAmount[0]?.total?.toFixed(2) || 0
    });
  } catch (err) {
    next(err);
  }
};


export const getInvoiceAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;

    //  Match base
    const match = {
      deletedAt: null
    };

    //  Filtro por fechas
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    //  KPIs (solo emitidas)
    const summary = await Invoice.aggregate([
      { $match: { ...match, status: "issued" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
          invoiceCount: { $sum: 1 },
          clients: { $addToSet: "$client.name" }
        }
      },
      {
        $project: {
          totalAmount: 1,
          invoiceCount: 1,
          uniqueClients: { $size: "$clients" },
          averageTicket: {
            $cond: [
              { $eq: ["$invoiceCount", 0] },
              0,
              { $divide: ["$totalAmount", "$invoiceCount"] }
            ]
          }
        }
      }
    ]);

    //  Facturación por fecha
    const byDate = await Invoice.aggregate([
      { $match: { ...match, status: "issued" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    //  Por estado 
    const byStatus = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    //  Top clientes
    // const topClients = await Invoice.aggregate([
    //   { $match: { ...match, status: "issued" } },
    //   {
    //     $group: {
    //       _id: "$client.name",
    //       total: { $sum: "$total" },
    //       invoices: { $sum: 1 }
    //     }
    //   },
    //   { $sort: { total: -1 } },
    //   { $limit: 5 }
    // ]);

    // //  Servicios más vendidos
    // const topServices = await Invoice.aggregate([
    //   { $match: { ...match, status: "issued" } },
    //   { $unwind: "$lines" },
    //   {
    //     $group: {
    //       _id: "$lines.description",
    //       total: { $sum: "$lines.lineTotal" },
    //       qty: { $sum: "$lines.qty" }
    //     }
    //   },
    //   { $sort: { total: -1 } },
    //   { $limit: 5 }
    // ]);

    res.json({
      summary: summary[0] || {
        totalAmount: 0,
        invoiceCount: 0,
        uniqueClients: 0,
        averageTicket: 0
      },
      byDate,
      byStatus,
      // topClients,
      // topServices
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
};


export const exportInvoicesCSV = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {
      deletedAt: null,
      status: "issued"
    };

    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const invoices = await Invoice.find(match).sort({ date: 1 });

    let csv = "Numero,Fecha,Cliente,Base,IVA,IRPF,Total,Estado\n";

    invoices.forEach(inv => {
      csv += [
        inv.number,
        new Date(inv.date).toLocaleDateString(),
        `"${inv.client.name}"`,
        inv.base.toFixed(2),
        inv.ivaAmount.toFixed(2),
        inv.irpfAmount?.toFixed(2) || "0.00",
        inv.total.toFixed(2),
        inv.status
      ].join(",") + "\n";
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=facturas.csv");

    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error exportando CSV" });
  }
};


export const exportInvoicesZip = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = { deletedAt: null, status: "issued" };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const invoices = await Invoice.find(match);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=facturas.zip"
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const invoice of invoices) {
      const pdfBuffer = await generateInvoicePDF(invoice);
      archive.append(pdfBuffer, {
        name: `${invoice.number}-${invoice.client.name}.pdf`,
      });
    }

    await archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error exportando ZIP" });
  }
};
