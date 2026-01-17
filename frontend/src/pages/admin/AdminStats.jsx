import { useEffect, useState } from "react";
import apiFetch from "../../services/api";
import StatsFilters from "../../components/stats/StatsFilters";
import KpiCard from "../../components/stats/KpiCard";
import StatusChart from "../../components/stats/StatusChart";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});


    const fetchStats = async (params = {}) => {
        setLoading(true);
        setFilters(params);

        const query = new URLSearchParams(params).toString();
        const data = await apiFetch(`/invoices/analytics?${query}`);

        setStats(data);
        setLoading(false);
    };

   useEffect(() => {
    const from = new Date();
    from.setMonth(from.getMonth() - 1);

    fetchStats({
        from: from.toISOString(),
        to: new Date().toISOString()
    });
}, []);


    const exportCSV = () => {
        const query = new URLSearchParams(filters).toString();

        window.open(
            `${import.meta.env.VITE_API_URL}/invoices/export/csv?${query}`,
            "_blank"
        );
    };

    const exportZIP = () => {
        const query = new URLSearchParams(filters).toString();

        window.open(
            `${import.meta.env.VITE_API_URL}/invoices/export/zip?${query}`,
            "_blank"
        );
    };


    return (
        <AdminLayout>
            <section className="admin-stats">
                <h1>📊 Estadísticas</h1>

                <StatsFilters onApply={fetchStats} />
                <div className="stats-actions">
                    <button className="btn-primary" onClick={exportCSV}>
                        📄 Exportar CSV fiscal
                    </button>
                <button className="btn-secondary" onClick={exportZIP}>
                    🗂️ Descargar ZIP PDFs
                </button>
                </div>





                {loading && <p>Cargando estadísticas…</p>}

                {stats && (
                    <>
                        {/* KPIs */}
                        <div className="kpi-grid">
                            <KpiCard title="Facturación total" value={`${stats.summary.totalAmount.toFixed(2)} €`} />
                            <KpiCard title="Facturas emitidas" value={stats.summary.invoiceCount} />
                            <KpiCard title="Clientes únicos" value={stats.summary.uniqueClients} />
                            <KpiCard title="Ticket medio" value={`${stats.summary.averageTicket.toFixed(2)} €`} />
                        </div>

                        {/* Gráficas */}
                        <div className="charts-grid">
                            <StatusChart data={stats.byStatus} />
                        </div>
                    </>
                )}
            </section>
        </AdminLayout>
    );
}
