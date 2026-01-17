import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS = {
  draft: "#9ca3af",
  issued: "#22c55e",
  cancelled: "#ef4444",
  rectified: "#f97316"
};

export default function StatusChart({ data }) {
  return (
    <div className="chart-card">
      <h3>Estado de facturas</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="_id"
            innerRadius={70}
            outerRadius={110}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={STATUS_COLORS[entry._id] || "#999"}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
