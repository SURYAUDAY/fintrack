"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";

interface Point {
  month: string;
  actual: number;
}

interface BudgetVsActualChartProps {
  data: Point[];
  budget: number;
}

export function BudgetVsActualChart({
  data,
  budget,
}: BudgetVsActualChartProps) {
  const merged = data.map((d) => ({ ...d, budget }));
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={merged} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
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
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === "actual" ? "Actual" : "Budget",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(v) => (v === "actual" ? "Actual" : "Budget")}
          />
          <ReferenceLine
            y={budget}
            stroke="#EF4444"
            strokeDasharray="4 4"
            label={{ value: "Budget", position: "right", fontSize: 11, fill: "#EF4444" }}
          />
          <Bar dataKey="budget" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
            {merged.map((d, i) => (
              <Cell
                key={i}
                fill={d.actual > budget ? "#EF4444" : "#3B5BDB"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
