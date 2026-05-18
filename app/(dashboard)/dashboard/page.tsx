"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAnomalies } from "@/hooks/useAnomalies";
import { usePermission } from "@/hooks/usePermission";
import { KPICard } from "@/components/ui/KPICard";
import {
  ChartSkeleton,
  KPICardSkeleton,
} from "@/components/ui/Skeleton";
import { ChartCard } from "@/components/charts/ChartCard";
import { MRRLineChart } from "@/components/charts/MRRLineChart";
import { RevenueExpensesBarChart } from "@/components/charts/RevenueExpensesBarChart";
import { ExpenseDonutChart } from "@/components/charts/ExpenseDonutChart";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { AIInsightsBanner } from "@/components/ui/AIInsightsBanner";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { PlanGate } from "@/components/ui/PlanGate";
import type { DateRange } from "@/types/dashboard";

const KPI_META = [
  { key: "mrr", icon: TrendingUp, accent: "#3B5BDB" },
  { key: "revenueYtd", icon: DollarSign, accent: "#0D9488" },
  { key: "totalExpenses", icon: CreditCard, accent: "#F97316" },
  { key: "netProfit", icon: TrendingUp, accent: "#7C3AED" },
  { key: "churnRate", icon: Users, accent: "#0EA5E9" },
  { key: "activeCustomers", icon: UserCheck, accent: "#10B981" },
] as const;

export default function DashboardPage() {
  const { data: session } = useSession();
  const canUseAI = usePermission("USE_AI");
  const [range, setRange] = useState<DateRange>("30d");
  const { data, isLoading, isError } = useDashboard(range);

  const [insightsOpen, setInsightsOpen] = useState(false);

  const anomalySeries = useMemo(
    () =>
      data?.mrrByMonth.map((p) => ({ month: p.month, value: p.mrr })),
    [data]
  );
  const { data: anomalies } = useAnomalies(anomalySeries, "MRR", canUseAI);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  const aiMetrics = data
    ? {
        mrr: data.kpis.mrr.value,
        revenue: data.kpis.revenueYtd.value,
        expenses: data.kpis.totalExpenses.value,
        netProfit: data.kpis.netProfit.value,
        churnRate: data.kpis.churnRate.value,
        activeCustomers: data.kpis.activeCustomers.value,
        mrrGrowth: data.kpis.mrr.change,
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {greeting}, {firstName} 👋
          </p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Key performance indicators"
      >
        {isLoading || !data
          ? KPI_META.map((m) => <KPICardSkeleton key={m.key} />)
          : KPI_META.map(({ key, icon, accent }) => {
              const kpi = data.kpis[key];
              return (
                <KPICard
                  key={key}
                  label={kpi.label}
                  value={kpi.formatted}
                  changeLabel={kpi.changeLabel}
                  changeType={kpi.changeType}
                  icon={icon}
                  accent={accent}
                />
              );
            })}
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {isLoading || !data ? (
            <ChartSkeleton />
          ) : (
            <ChartCard title="MRR Growth" subtitle="Last 12 months">
              <MRRLineChart
                data={data.mrrByMonth}
                anomalies={anomalies ?? []}
              />
            </ChartCard>
          )}
        </div>
        <div className="lg:col-span-2">
          {isLoading || !data ? (
            <ChartSkeleton height={220} />
          ) : (
            <ChartCard title="Expenses by Category" subtitle="This month">
              <ExpenseDonutChart
                data={data.expenseByCategory}
                total={data.totalExpenseAmount}
              />
            </ChartCard>
          )}
        </div>
      </section>

      <section>
        {isLoading || !data ? (
          <ChartSkeleton />
        ) : (
          <ChartCard title="Revenue vs Expenses" subtitle="12-month comparison">
            <RevenueExpensesBarChart data={data.revenueVsExpenses} />
          </ChartCard>
        )}
      </section>

      <PlanGate requiredPlan="PRO" feature="AI Insights">
        <AIInsightsBanner onExplain={() => setInsightsOpen(true)} />
      </PlanGate>

      <InsightsPanel
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        metrics={aiMetrics}
        anomalies={anomalies}
      />

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          Could not load dashboard data. Refresh to try again.
        </div>
      )}
    </div>
  );
}
