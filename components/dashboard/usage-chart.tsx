"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SubscriptionUsageResponse } from "@/lib/types/dashboard";
import { format, parseISO } from "date-fns";

interface UsageChartProps {
  data: SubscriptionUsageResponse | null;
  loading?: boolean;
  height?: number;
}

function formatDay(dateStr: string, periodDays: number) {
  try {
    const d = parseISO(dateStr);
    return periodDays <= 7 ? format(d, "EEE M/d") : format(d, "MMM d");
  } catch {
    return dateStr;
  }
}

export function UsageChart({ data, loading, height = 280 }: UsageChartProps) {
  if (loading || !data) {
    return (
      <div
        className="rounded-xl border border-border bg-card/30"
        style={{ height }}
      >
        <div className="flex h-full items-center justify-center text-muted-foreground">
          {loading ? "Loading chart…" : "No usage data"}
        </div>
      </div>
    );
  }

  const chartData = data.daily.map(({ date, requests }) => ({
    date,
    label: formatDay(date, data.period_days),
    requests,
  }));

  if (chartData.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card/30"
        style={{ height }}
      >
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No usage in this period
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-border bg-card/30 p-4"
      style={{ height: height + 32 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date
                ? format(parseISO(payload[0].payload.date), "PPP")
                : ""
            }
            formatter={(value: number) => [value, "Requests"]}
          />
          <Line
            type="monotone"
            dataKey="requests"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
