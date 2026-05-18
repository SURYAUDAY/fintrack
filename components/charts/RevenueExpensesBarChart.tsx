"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueExpensesPoint } from "@/types/dashboard";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";

interface Props {
  data: RevenueExpensesPoint[];
}

export function RevenueExpensesBarChart({ data }: Props) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
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
              name === "revenue" ? "Revenue" : "Expenses",
            ]}
          />
          <Legend
            iconType="square"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(v) => (v === "revenue" ? "Revenue" : "Expenses")}
          />
          <Bar dataKey="revenue" fill="#3B5BDB" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
