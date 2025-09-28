import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.FASTAPI_URL || "http://localhost:8000";

const EquipValueIsland = () => {
  const [total, setTotal] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch total value immediately
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await fetch(`${API_BASE}/total`);
        if (!res.ok) throw new Error("Failed to fetch total");
        const data = await res.json();
        setTotal(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load total value");
      }
    };
    fetchTotal();
  }, []);

  const fetchBreakdown = async () => {
    if (breakdown) return; // already loaded
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/breakdown`);
      if (!res.ok) throw new Error("Failed to fetch breakdown");
      const data = await res.json();
      setBreakdown(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load breakdown");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setExpanded((prev) => !prev);
    if (!expanded && !breakdown) {
      fetchBreakdown();
    }
  };

  return (
    <section className="scoreboard-section wealth-island">

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Collapsed view */}
      {!expanded && total && (
        <div className="scheduled-game" onClick={handleToggle} style={{ cursor: "pointer" }}>
          <p>I am currently bankstanding in gear worth approx: {total.total_compact}</p>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            (click to expand)
          </p>
        </div>
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="scheduled-game">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>Breakdown</h4>
            <button onClick={handleToggle} style={{ padding: "0.25rem 0.5rem" }}>
              Collapse
            </button>
          </div>

          {loading && <p>Loading breakdown...</p>}

          {breakdown && (
            <>
              <p>
                <strong>Total:</strong> {breakdown.total.formatted}
              </p>
              <table style={{ width: "100%", marginTop: "1rem" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Item</th>
                    <th style={{ textAlign: "right" }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.item}</td>
                      <td style={{ textAlign: "right" }}>{it.subtotal_formatted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default EquipValueIsland;
