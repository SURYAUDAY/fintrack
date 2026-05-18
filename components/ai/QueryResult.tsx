"use client";

import { Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/charts/ChartCard";
import { CategoryBadge, TypeBadge } from "@/components/ui/Badge";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";

export interface QueryResultData {
  filter: Record<string, unknown>;
  source: "transactions" | "customers";
  interpretation: string;
  total: number;
  sumAmount?: number;
  sumMrr?: number;
  data: Array<Record<string, unknown>>;
  chart: { name: string; value: number }[];
}

interface QueryResultProps {
  result: QueryResultData;
}

export function QueryResult({ result }: QueryResultProps) {
  const totalLabel =
    result.source === "customers"
      ? `${result.total} customers · ${formatCurrency(result.sumMrr ?? 0)} MRR`
      : `${result.total} transactions · ${formatCurrency(result.sumAmount ?? 0)} total`;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 dark:border-purple-900/30 dark:bg-purple-950/20">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
          <div>
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
              {result.interpretation}
            </p>
            <p className="mt-0.5 text-xs text-purple-700 dark:text-purple-300/80">
              {totalLabel}
            </p>
          </div>
        </div>
      </div>

      {result.chart.length > 0 && (
        <ChartCard title="Results" subtitle="Grouped by query">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.chart}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" tickLine={false} />
                <YAxis
                  fontSize={11}
                  stroke="#94A3B8"
                  tickLine={false}
                  tickFormatter={(v) => formatCurrencyCompact(Number(v))}
                />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#3B5BDB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {result.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            {result.source === "customers" ? (
              <CustomersResultTable data={result.data} />
            ) : (
              <TransactionsResultTable data={result.data} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionsResultTable({
  data,
}: {
  data: Array<Record<string, unknown>>;
}) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
        <tr>
          <th className="px-4 py-3 text-left font-medium">Date</th>
          <th className="px-4 py-3 text-left font-medium">Description</th>
          <th className="px-4 py-3 text-left font-medium">Category</th>
          <th className="px-4 py-3 text-left font-medium">Type</th>
          <th className="px-4 py-3 text-right font-medium">Amount</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 50).map((row, i) => (
          <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
            <td className="px-4 py-3">
              {new Date(row.date as string).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </td>
            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
              {row.description as string}
            </td>
            <td className="px-4 py-3">
              <CategoryBadge category={row.category as string} />
            </td>
            <td className="px-4 py-3">
              <TypeBadge type={row.type as "INCOME" | "EXPENSE"} />
            </td>
            <td className="px-4 py-3 text-right font-semibold">
              {formatCurrency(Number(row.amount))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomersResultTable({
  data,
}: {
  data: Array<Record<string, unknown>>;
}) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
        <tr>
          <th className="px-4 py-3 text-left font-medium">Name</th>
          <th className="px-4 py-3 text-left font-medium">Plan</th>
          <th className="px-4 py-3 text-right font-medium">MRR</th>
          <th className="px-4 py-3 text-left font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 50).map((row, i) => (
          <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
              {row.name as string}
            </td>
            <td className="px-4 py-3">{row.plan as string}</td>
            <td className="px-4 py-3 text-right font-semibold">
              {formatCurrency(Number(row.mrr))}
            </td>
            <td className="px-4 py-3">{row.status as string}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
