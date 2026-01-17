const TopClients = ({ data }) => (
  <div className="table-card">
    <h3>Mejores Clientes</h3>
    <table>
      <thead><tr><th>Cliente</th><th>Total €</th></tr></thead>
      <tbody>
        {data.map(c => (
          <tr key={c._id}>
            <td>{c._id}</td>
            <td>{c.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TopClients;
