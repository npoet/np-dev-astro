import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TimeseriesPoint {
  timestamp: number;
  avgHighPrice: number;
  avgLowPrice: number;
  highPriceVolume: number;
  lowPriceVolume: number;
}

export function IslandTimeseries({ islandId }: { islandId: string }) {
  const [data, setData] = useState<TimeseriesPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/timeseries?island=${islandId}`);
        const json = await res.json();
        setData(
          json.data.map((d: TimeseriesPoint) => ({
            ...d,
            timestamp: d.timestamp * 1000, // convert to ms
            totalVolume: d.highPriceVolume + d.lowPriceVolume,
          }))
        );
      } catch (err) {
        console.error("Error fetching timeseries:", err);
      }
    };

    fetchData();
  }, [islandId]);

  return (
    <Card className="mt-6">
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">Price & Volume History</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) =>
                  new Date(ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              {/* Left axis: Price */}
              <YAxis
                yAxisId="left"
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                  }).format(v)
                }
              />
              {/* Right axis: Volume */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                  }).format(v)
                }
              />
              <Tooltip
                labelFormatter={(ts) =>
                  new Date(ts).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                }
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat("en-US").format(value),
                  name,
                ]}
              />
              <Legend />
              {/* Volume bars */}
              <Bar
                yAxisId="right"
                dataKey="totalVolume"
                name="Trade Volume"
                fill="#9ca3af"
                opacity={0.5}
              />
              {/* Price lines */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgHighPrice"
                stroke="#22c55e"
                name="Avg High Price"
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgLowPrice"
                stroke="#3b82f6"
                name="Avg Low Price"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
