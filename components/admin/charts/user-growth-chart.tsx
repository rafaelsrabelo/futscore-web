"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  DashboardGrowthBucket,
  DashboardGrowthPeriod,
} from "@/lib/admin/types";

function formatBucket(iso: string, period: DashboardGrowthPeriod): string {
  try {
    const d = new Date(iso);
    if (period === "monthly") {
      return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    }
    if (period === "weekly") {
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

export function UserGrowthChart({
  series,
  period,
}: {
  series: DashboardGrowthBucket[];
  period: DashboardGrowthPeriod;
}) {
  const data = series.map((point) => ({
    label: formatBucket(point.bucket, period),
    Atletas: point.newAthletes,
    Olheiros: point.newObservers,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        Sem dados no período.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <defs>
            <linearGradient id="athletesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="observersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="label"
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.3 }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="Atletas"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#athletesFill)"
          />
          <Area
            type="monotone"
            dataKey="Olheiros"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#observersFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
