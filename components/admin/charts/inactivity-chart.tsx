"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardInactivityBucket } from "@/lib/admin/types";

const COLORS: Record<string, string> = {
  "0-7d": "var(--color-primary)",
  "7-30d": "#4ade80",
  "30-90d": "#fbbf24",
  "90-180d": "#fb923c",
  "180d+": "#f87171",
  never: "var(--color-muted-foreground)",
};

export function InactivityChart({
  buckets,
}: {
  buckets: DashboardInactivityBucket[];
}) {
  const data = buckets.map((b) => ({
    label: b.label === "never" ? "Nunca" : b.label,
    count: b.count,
    color: COLORS[b.label] ?? "var(--color-muted-foreground)",
  }));

  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
        Sem dados de retenção.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 0, left: -8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            strokeOpacity={0.5}
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "var(--color-muted)", fillOpacity: 0.3 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
