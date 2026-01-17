// src/components/CreateInvoiceModal.jsx
import React, { useEffect, useState } from "react";
import apiFetch from "../services/api";

const CreateInvoiceModal = ({ invoice = null, onClose, onCreated }) => {
  const [client, setClient] = useState({ name: "", nif: "", address: "", phone: "", email: "" });
  const [lines, setLines] = useState([{ description: "", qty: 1, unitPrice: 0 }]);
  const [ivaPercent, setIvaPercent] = useState(21);
  const [ivaIncluido, setIvaIncluido] = useState(false);
  const [irpfPercent, setIrpfPercent] = useState(0);
  const [loading, setLoading] = useState(false);

  // llenar si editamos
  useEffect(() => {
    if (invoice) {
      setClient(invoice.client || { name: "", nif: "", address: "", phone: "", email: "" });
      setLines(invoice.lines && invoice.lines.length ? invoice.lines : [{ description: "", qty: 1, unitPrice: 0 }]);
      setIvaPercent(invoice.ivaPercent ?? 21);
      setIvaIncluido(invoice.ivaIncluido ?? false);
      setIrpfPercent(invoice.irpfPercent ?? 0);
    }
  }, [invoice]);

  // body modal class
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const addLine = () => setLines([...lines, { description: "", qty: 1, unitPrice: 0 }]);
  const removeLine = (index) => setLines(lines.filter((_, i) => i !== index));

  const calculateBase = () => {
    let base = 0;
    lines.forEach((l) => {
      if (ivaIncluido && ivaPercent > 0) {
        const precioSinIVA = l.unitPrice / (1 + ivaPercent / 100);
        base += precioSinIVA * l.qty;
      } else {
        base += l.unitPrice * l.qty;
      }
    });
    return +base.toFixed(2);
  };

  const base = calculateBase();
  const ivaAmount = +(base * (ivaPercent / 100)).toFixed(2);
  const irpfAmount = +(base * (irpfPercent / 100)).toFixed(2);
  const total = +(base + ivaAmount - irpfAmount).toFixed(2);

  // Guardar borrador (create o patch si editando)
  const saveDraft = async () => {
    if (!client.name || !lines.length) return alert("Completa cliente y líneas");
    setLoading(true);
    try {
      const payload = { client, lines, ivaPercent, irpfPercent, ivaIncluido, status: "draft" };
      if (invoice?._id) {
        await apiFetch(`/invoices/${invoice._id}`, "PATCH", payload);
      } else {
        await apiFetch("/invoices", "POST", payload);
      }
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error guardando borrador");
    } finally {
      setLoading(false);
    }
  };

  // Emitir (si se está editando -> emitir existente, si no -> crear + emitir)
  const emitir = async () => {
    if (!client.name || !lines.length) return alert("Completa cliente y líneas");
    if (!window.confirm("¿Seguro que deseas emitir esta factura? Una vez emitida no se podrá editar.")) return;
    setLoading(true);
    try {
      const payload = { client, lines, ivaPercent, irpfPercent, ivaIncluido };
      if (invoice?._id) {
      // ✅ Emitir factura existente, enviando cambios antes de emitir
      await apiFetch(`/invoices/${invoice._id}/issue`, "POST", payload);
    } else {
      // Crear directamente como emitida (si es nueva)
      await apiFetch("/invoices", "POST", { ...payload, status: "issued" });
    }
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al emitir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" >
      <div className="modal-content large">
        <h3>{invoice ? (invoice.status === "draft" ? "Editar Borrador" : "Ver Factura") : "Nueva Factura"}</h3>

        <form onSubmit={(e) => e.preventDefault()}>
          <label>Nombre del cliente</label>
          <input type="text" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} required />

          <label>NIF</label>
          <input type="text" value={client.nif} onChange={(e) => setClient({ ...client, nif: e.target.value })} />

          <label>Dirección</label>
          <input type="text" value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} />

          <label>Teléfono</label>
          <input type="text" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} />

          <label>Email</label>
          <input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} />

          <h4 style={{ marginTop: "1rem" }}>Servicios</h4>
          <div className="invoice-line-header">
            <span>Descripción</span>
            <span>Cantidad</span>
            <span>Precio (€)</span>
          </div>

          {lines.map((line, idx) => (
            <div className="invoice-line" key={idx}>
              <input type="text" placeholder="Descripción" value={line.description} onChange={(e) => handleLineChange(idx, "description", e.target.value)} required />
              <input type="number" min="1" value={line.qty} onChange={(e) => handleLineChange(idx, "qty", Number(e.target.value))} />
              <input type="number" step="0.01" value={line.unitPrice} onChange={(e) => handleLineChange(idx, "unitPrice", Number(e.target.value))} />
              {lines.length > 1 && <button type="button" className="btn-remove-line" onClick={() => removeLine(idx)}>✕</button>}
            </div>
          ))}

          <button type="button" className="btn-add-line" onClick={addLine}>+ Añadir servicio</button>

          <div className="taxes">
            <div>
              <label>IVA (%)</label>
              <input type="number" step="0.01" value={ivaPercent} onChange={(e) => setIvaPercent(Number(e.target.value))} />
            </div>
            <div className="iva-option">
              <label><input type="checkbox" checked={ivaIncluido} onChange={() => setIvaIncluido(!ivaIncluido)} /> IVA incluido en precios</label>
            </div>
            <div>
              <label>IRPF (%)</label>
              <input type="number" step="0.01" value={irpfPercent} onChange={(e) => setIrpfPercent(Number(e.target.value))} />
            </div>
          </div>

          <div className="totals">
            <p><strong>Base:</strong> €{base.toFixed(2)}</p>
            <p><strong>{ivaIncluido ? "IVA (incluido):" : "IVA:"}</strong> €{ivaAmount.toFixed(2)}</p>
            <p><strong>IRPF:</strong> €{irpfAmount.toFixed(2)}</p>
            <p><strong>Total:</strong> €{total.toFixed(2)}</p>
          </div>

          <div className="modal-buttons">
            {/* Solo habilitar editar/guardar si es borrador o nuevo */}
            <button type="button" onClick={saveDraft} disabled={loading || (invoice && invoice.status !== "draft")}>
              💾 Guardar borrador
            </button>

            <button type="button" onClick={emitir} disabled={loading || (invoice && ["issued", "cancelled", "rectified"].includes(invoice.status))}>
              ✅ Emitir factura
            </button>

            <button type="button" onClick={onClose}>❌ Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
