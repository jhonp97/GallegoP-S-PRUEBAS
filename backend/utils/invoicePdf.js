import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { companyData } from "../config/config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

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
      reject(err);
    }
  });
};
