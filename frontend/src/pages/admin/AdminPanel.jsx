// src/pages/admin/AdminPanel.jsx
import React, { useEffect, useState, useCallback } from "react";
import apiFetch from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";
import CreateInvoiceModal from "../../components/CreateInvoiceModal";

const statusLabel = {
  draft: { text: "Borrador", color: "#f59e0b" }, // amarillo
  issued: { text: "Emitida", color: "#10b981" }, // verde
  cancelled: { text: "Anulada", color: "#ef4444" }, // rojo
  rectified: { text: "Rectificada", color: "#6b46c1" }, // morado
};

const AdminPanel = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("desc");
  const [statusFilter, setStatusFilter] = useState(""); // '', 'draft', 'issued', ...
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
  const [allInvoices, setAllInvoices] = useState([]);
  const limit = 10;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      // Si hay búsqueda, cargar todas las facturas (sin paginación)
      if (searchTerm.trim()) {
        let url = `/invoices?limit=10000&sort=${sort}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        const res = await apiFetch(url, "GET");
        setAllInvoices(res.data);
        setTotal(res.total);
        setInvoices(res.data); // Se filtrarán en tiempo real abajo
      } else {
        // Si no hay búsqueda, usar paginación normal
        let url = `/invoices?page=${page}&limit=${limit}&sort=${sort}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        const res = await apiFetch(url, "GET");
        setInvoices(res.data);
        setAllInvoices(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, statusFilter, searchTerm]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Filtro en tiempo real para búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Si el búsqueda está vacío, mostrar las facturas sin filtrar
      setInvoices(allInvoices);
      return;
    }

    // Filtrar facturas por número o nombre de cliente
    const handler = setTimeout(() => {
    const filtered = allInvoices.filter((inv) => {
      const searchLower = searchTerm.toLowerCase();
      const numberMatch = (inv.number || "").toLowerCase().includes(searchLower);
      const clientMatch = (inv.client?.name || "").toLowerCase().includes(searchLower);
      return numberMatch || clientMatch;
    });

    setInvoices(filtered);
    }, 400);

    // Limpieza: si el usuario sigue escribiendo, cancela el timeout anterior 
     return () => clearTimeout(handler);
  },  [searchTerm, allInvoices]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await apiFetch("/invoices/stats", "GET");
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalPages = Math.ceil(total / limit);

  // acciones
  const handleIssue = async (inv) => {
    if (!window.confirm("¿Emitir esta factura? Una vez emitida no se podrá editar.")) return;
    try {
      const payload = {
        client: inv.client, 
        lines: inv.lines, 
        ivaPercent: inv.ivaPercent, 
        irpfPercent: inv.irpfPercent, 
        ivaIncluido: inv.ivaIncluido,
      };
      await apiFetch(`/invoices/${inv._id}/issue`, "POST", payload);
      await fetchInvoices();
      await fetchStats();
    } catch (err) {
      console.error(err);
      alert("Error al emitir");
    }
  };

  const handleDeleteDraft = async (id) => {
    if (!window.confirm("¿Eliminar este borrador?")) return;
    try {
      await apiFetch(`/invoices/${id}`, "DELETE");
      await fetchInvoices();
      await fetchStats();
    } catch (err) {
      console.error(err);
      alert("Error eliminando borrador");
    }
  };

  const handleCancelInvoice = async (id) => {
    const reason = prompt("Indica el motivo de la anulación:");
    if (!reason) return alert("Debe indicar un motivo.");
    try {
      await apiFetch(`/invoices/${id}/cancel`, "POST", { reason });
      await fetchInvoices();
      await fetchStats();
    } catch (err) {
      console.error(err);
      alert("Error al anular");
    }
  };

  const handleRectifyInvoice = async (id) => {
    const reason = prompt("Motivo de la rectificación (obligatorio):");
    if (!reason) return alert("Se necesita motivo.");
    try {
    // creamos rectificativa con las mismas líneas por defecto
    const res = await apiFetch(`/invoices/${id}/rectify`, "POST", { reason });
    // abrir automáticamente el modal para editarla
    setEditingInvoice(res.rect);
    setShowCreateModal(true);
  } catch (err) {
    console.error(err);
    alert("Error al crear rectificativa");
  }
};

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h2>Panel de Control</h2>

        {loadingStats ? (
          <p>Cargando estadísticas...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total de Facturas</h3>
              <p>{stats?.totalInvoices || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Facturado (€)</h3>
              <p>{stats?.totalAmount || "0.00"}</p>
            </div>
          </div>
        )}

        <div className="header-row">
          <h2>Facturas registradas</h2>
          <button className="btn-create-invoice" onClick={() => { setEditingInvoice(null); setShowCreateModal(true); }}>
            + Crear Factura
          </button>
        </div>

        <div className="filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por número de factura o nombre de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="btn-clear-search"
                onClick={() => setSearchTerm("")}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <label>Ordenar por:</label>
          <select onChange={(e) => setSort(e.target.value)} value={sort}>
            <option value="desc">Más recientes</option>
            <option value="asc">Más antiguas</option>
          </select>

          <label style={{ marginLeft: 12 }}>Estado:</label>
          <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
            <option value="">Todos</option>
            <option value="draft">Borradores</option>
            <option value="issued">Emitidas</option>
            <option value="cancelled">Anuladas</option>
            <option value="rectified">Rectificadas</option>
          </select>
        </div>

        {loading ? (
          <p>Cargando facturas...</p>
        ) : invoices.length === 0 ? (
          <p>No hay facturas registradas aún.</p>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total (€)</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td>{inv.number || "—"}</td>
                      <td>{inv.client?.name || "—"}</td>
                      <td>{new Date(inv.date).toLocaleDateString("es-ES")}</td>
                      <td>{(inv.total || 0).toFixed(2)}</td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: 12,
                          background: statusLabel[inv.status]?.color || "#999",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.85rem"
                        }}>
                          {statusLabel[inv.status]?.text || inv.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" title="Ver" onClick={() => setShowPreview(inv)}>👁️</button>

                        {inv.status === "draft" && (
                          <>
                            <button className="btn-icon" title="Editar" onClick={() => { setEditingInvoice(inv); setShowCreateModal(true); }}>✏️</button>
                            <button className="btn-icon" title="Emitir" onClick={() => handleIssue(inv)}>✅</button>
                            <button className="btn-icon" title="Eliminar" onClick={() => handleDeleteDraft(inv._id)}>🗑️</button>
                            <button className="btn-icon" title="Descargar PDF" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/pdf`, "_blank")}>⬇️</button>
                          </>
                        )}

                        {inv.status === "issued" && (
                          <>
                            <button className="btn-icon" title="Anular" onClick={() => handleCancelInvoice(inv._id)}>❌</button>
                            <button className="btn-icon" title="Rectificar" onClick={() => handleRectifyInvoice(inv._id)}>📝</button>
                            <button className="btn-icon" title="Descargar PDF" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/pdf`, "_blank")}>⬇️</button>
                          </>
                        )}

                        {inv.status === "cancelled" && (
                          <>
                            <button className="btn-icon" title="Descargar PDF" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/pdf`, "_blank")}>⬇️</button>
                          </>
                        )}

                        {inv.status === "rectified" && (
                          <>
                            <button className="btn-icon" title="Descargar PDF" onClick={() => window.open(`${import.meta.env.VITE_API_URL}/invoices/${inv._id}/pdf`, "_blank")}>⬇️</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              {!searchTerm && (
                <>
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>←</button>
                  <span> Página {page} de {totalPages} </span>
                  <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>→</button>
                </>
              )}
              {searchTerm && <span>Mostrando {invoices.length} resultado(s)</span>}
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateInvoiceModal
          invoice={editingInvoice}
          onClose={() => { setShowCreateModal(false); setEditingInvoice(null); }}
          onCreated={async () => { await fetchInvoices(); await fetchStats(); }}
        />
      )}

      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>Factura {showPreview.number}</h3>
            <div className="invoice-preview">
              <div className="invoice-info">
                <p><strong>Cliente:</strong> {showPreview.client?.name || "—"}</p>
                <p><strong>Fecha:</strong> {new Date(showPreview.date).toLocaleDateString("es-ES")}</p>
                {showPreview.status === "cancelled" && <p><strong>Motivo anulación:</strong> {showPreview.cancelReason}</p>}
                {showPreview.status === "rectified" && showPreview.rectifies && <p><strong>Rectifica a:</strong> {showPreview.rectifies}</p>}
              </div>

              <table className="preview-table">
                <thead>
                  <tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {showPreview.lines.map((l, i) => (<tr key={i}><td>{l.description}</td><td>{l.qty}</td><td>{l.unitPrice.toFixed(2)}€</td><td>{l.lineTotal.toFixed(2)}€</td></tr>))}
                </tbody>
              </table>

              <div className="totals">
                <p><strong>Base:</strong> {showPreview.base.toFixed(2)}€</p>
                <p><strong>IVA:</strong> {showPreview.ivaAmount.toFixed(2)}€</p>
                <p><strong>Total:</strong> {showPreview.total.toFixed(2)}€</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button onClick={() => setShowPreview(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPanel;
