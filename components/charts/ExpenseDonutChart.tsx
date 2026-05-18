"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ExpenseCategorySlice } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: ExpenseCategorySlice[];
  total: number;
}

export function ExpenseDonutChart({ data, total }: Props) {
  const totalAll = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="flex flex-col">
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Total
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {data.map((slice) => {
          const pct = ((slice.value / totalAll) * 100).toFixed(0);
          return (
            <li
              key={slice.name}
              className="flex items-center justify-between text-slate-600 dark:text-slate-300"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: slice.color }}
                />
                {slice.name}
              </span>
              <span className="font-medium">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
