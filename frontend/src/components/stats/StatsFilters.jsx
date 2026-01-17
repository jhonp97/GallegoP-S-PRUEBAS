import React, { useState } from "react";

export default function StatsFilters({ onApply }) {
  const applyRange = (months) => {
    const to = new Date();
    const from = new Date();
    from.setMonth(to.getMonth() - months);

    onApply({
      from: from.toISOString(),
      to: to.toISOString()
    });
  };

  // Estado para los inputs de calendario 
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");

  const handleApplyCalendar = () => {
    setError(""); if (!fromDate || !toDate) { setError("Selecciona ambas fechas"); return; }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Normalizar horas: from al inicio del día, to al final del día
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    if (from > to) {
      setError("La fecha de inicio no puede ser posterior a la fecha actual");
      return;
    }
    onApply({
      from: from.toISOString(),
      to: to.toISOString(),
    });

    setFromDate("");
    setToDate("");
  };

  return (
    <div className="stats-filters">
      <div className="button-filters">
        <button onClick={() => applyRange(1)}>Último mes</button>
        <button onClick={() => applyRange(3)}>3 meses</button>
        <button onClick={() => applyRange(6)}>6 meses</button>
        <button onClick={() => applyRange(12)}>Año</button>
      </div>
      <div className="calendar-filter">
        <label className="sr-only">Desde</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          aria-label="Fecha desde"
        />

        <label className="sr-only">Hasta</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          aria-label="Fecha hasta"
        />

      <button onClick={handleApplyCalendar}>Aplicar</button>
      </div>

      {error && <div className="stats-filters-error" role="alert">{error}</div>}
    </div>
  );
}
