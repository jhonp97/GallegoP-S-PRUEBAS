export default function KpiCard({ title, value }) {
  return (
    <div className="kpi-card">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
    </div>
  );
}
