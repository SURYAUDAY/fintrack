"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MrrPoint } from "@/types/dashboard";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import type { Anomaly } from "@/hooks/useAnomalies";

interface MRRLineChartProps {
  data: MrrPoint[];
  anomalies?: Anomaly[];
}

interface AnomalyDotProps {
  cx?: number;
  cy?: number;
  payload?: { month: string };
  anomalies: Anomaly[];
}

function AnomalyDot({ cx, cy, payload, anomalies }: AnomalyDotProps) {
  if (cx === undefined || cy === undefined || !payload) return null;
  const isAnomalous = anomalies.some((a) => a.month === payload.month);
  if (!isAnomalous) {
    return <circle cx={cx} cy={cy} r={3} fill="#3B5BDB" />;
  }
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="#FBBF24"
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="#78350F"
        fontSize={10}
        fontWeight={700}
      >
        !
      </text>
    </g>
  );
}

export function MRRLineChart({ data, anomalies = [] }: MRRLineChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B5BDB" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3B5BDB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94A3B8"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <YAxis
            stroke="#94A3B8"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tickFormatter={(v) => formatCurrencyCompact(Number(v))}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              fontSize: 12,
            }}
            formatter={(value: number) => [formatCurrency(value), "MRR"]}
            labelFormatter={(label, points) => {
              const month = (points?.[0]?.payload as { month: string } | undefined)
                ?.month;
              const anomaly = month
                ? anomalies.find((a) => a.month === month)
                : undefined;
              return anomaly ? `${label} ⚠ ${anomaly.explanation}` : label;
            }}
          />
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="#3B5BDB"
            strokeWidth={2}
            fill="url(#mrrFill)"
            dot={<AnomalyDot anomalies={anomalies} />}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
