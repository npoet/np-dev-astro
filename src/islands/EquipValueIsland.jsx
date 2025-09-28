import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE = import.meta.env.FASTAPI_URL || "https://api.npoet.dev/osrs";

const EquipValueIsland = () => {
  const [total, setTotal] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch total immediately
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

  // Fetch breakdown on expansion
  const fetchBreakdown = async () => {
    if (breakdown) return;
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

  // Fetch timeseries for chart
  const fetchTimeseries = async () => {
    if (timeseries.length) return;
    try {
      const res = await fetch(`${API_BASE}/timeseries`);
      if (!res.ok) throw new Error("Failed to fetch timeseries");
      const data = await res.json();
      setTimeseries(
        data.data.map((d) => ({
          ...d,
          timestamp: d.timestamp * 1000, // convert to ms
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = () => {
    setExpanded((prev) => !prev);
    if (!expanded) {
      fetchBreakdown();
      fetchTimeseries();
    }
  };

  return (
    <section className="scoreboard-section wealth-island">
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Collapsed view */}
      {!expanded && total && (
        <div className="scheduled-game" onClick={handleToggle} style={{ cursor: "pointer" }}>
          <p>I am currently bankstanding in gear worth approx: {total.total_compact}</p>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>(click to expand)</p>
        </div>
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="scheduled-game">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>Breakdown</h4>
            <button onClick={handleToggle} style={{ padding: "0.25rem 0.5rem" }}>Collapse</button>
          </div>

          {/* Chart */}
          {timeseries.length > 0 && (
              <div style={{ height: 250, marginTop: "1rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeseries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(ts) =>
                        new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      }
                    />
                    <YAxis
                      domain={[
                        Math.min(...timeseries.map((d) => d.avgHighPrice)) * 0.95, // 5% below min
                        Math.max(...timeseries.map((d) => d.avgHighPrice)) * 1.05, // 5% above max
                      ]} hide
                    />
                    <Tooltip
                      labelFormatter={(ts) =>
                        new Date(ts).toLocaleString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                      }
                      formatter={(value) => new Intl.NumberFormat("en-US").format(value)}
                    />
                    <Line type="monotone" dataKey="avgHighPrice" stroke="#22c55e" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

          {loading && <p>Loading breakdown...</p>}

          {breakdown && (
            <>
              <p><strong>Total:</strong> {breakdown.total.formatted}</p>
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
