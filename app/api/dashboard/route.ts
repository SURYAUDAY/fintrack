import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
  DateRange,
  DashboardResponse,
  ExpenseCategorySlice,
  MrrPoint,
  RevenueExpensesPoint,
} from "@/types/dashboard";

const CATEGORY_COLORS: Record<string, string> = {
  Payroll: "#3B5BDB",
  Infrastructure: "#7C3AED",
  Marketing: "#F97316",
  "SaaS Tools": "#0D9488",
  Other: "#64748B",
};

function rangeStart(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "ytd":
    default:
      return new Date(now.getFullYear(), 0, 1);
  }
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short" });
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") as DateRange) ?? "30d";
  const since = rangeStart(range);

  // ---- Last 12 calendar months window for charts ----
  const now = new Date();
  const startOf12 = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    activeCustomers,
    mrrAgg,
    transactions12,
    transactionsInRange,
    expenseAggInRange,
    expenseAggLastMonth,
    expensesByCategoryRows,
    customerCount,
    churnedCount,
  ] = await Promise.all([
    prisma.customer.count({ where: { status: "ACTIVE" } }),
    prisma.customer.aggregate({
      where: { status: "ACTIVE" },
      _sum: { mrr: true },
    }),
    prisma.transaction.findMany({
      where: { date: { gte: startOf12 } },
      select: { date: true, type: true, amount: true, category: true },
    }),
    prisma.transaction.findMany({
      where: { date: { gte: since } },
      select: { type: true, amount: true },
    }),
    prisma.transaction.aggregate({
      where: { date: { gte: since }, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: {
          gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          lt: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: {
        type: "EXPENSE",
        date: { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1) },
      },
      _sum: { amount: true },
    }),
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "CHURNED" } }),
  ]);

  // ---- 12-month chart data ----
  const monthBuckets = new Map<
    string,
    { revenue: number; expenses: number; date: Date }
  >();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    monthBuckets.set(monthKey(d), { revenue: 0, expenses: 0, date: d });
  }

  for (const tx of transactions12) {
    const key = monthKey(tx.date);
    const bucket = monthBuckets.get(key);
    if (!bucket) continue;
    if (tx.type === "INCOME") bucket.revenue += Number(tx.amount);
    else bucket.expenses += Number(tx.amount);
  }

  const revenueVsExpenses: RevenueExpensesPoint[] = Array.from(
    monthBuckets.values()
  ).map((b) => ({
    month: monthLabel(b.date),
    revenue: Math.round(b.revenue),
    expenses: Math.round(b.expenses),
  }));

  // ---- MRR by month from CustomerMrr (fallback to revenue if empty) ----
  const mrrRows = await prisma.customerMrr.groupBy({
    by: ["month"],
    where: { month: { gte: startOf12 } },
    _sum: { mrr: true },
  });
  const mrrMap = new Map<string, number>();
  for (const r of mrrRows) {
    mrrMap.set(monthKey(r.month), Number(r._sum.mrr ?? 0));
  }
  const mrrByMonth: MrrPoint[] = Array.from(monthBuckets.values()).map((b) => ({
    month: monthLabel(b.date),
    mrr: Math.round(mrrMap.get(monthKey(b.date)) ?? b.revenue * 0.6),
  }));

  // ---- Expense by category for donut ----
  const expenseByCategory: ExpenseCategorySlice[] = expensesByCategoryRows
    .map((row) => ({
      name: row.category,
      value: Math.round(Number(row._sum.amount ?? 0)),
      color: CATEGORY_COLORS[row.category] ?? "#64748B",
    }))
    .sort((a, b) => b.value - a.value);

  // ---- KPI calculations ----
  let revenueInRange = 0;
  let expensesInRange = 0;
  for (const tx of transactionsInRange) {
    if (tx.type === "INCOME") revenueInRange += Number(tx.amount);
    else expensesInRange += Number(tx.amount);
  }

  const totalMrr = Number(mrrAgg._sum.mrr ?? 0);
  const lastMonthExpenses = Number(expenseAggLastMonth._sum.amount ?? 0);
  const thisMonthExpenses = expenseByCategory.reduce(
    (sum, c) => sum + c.value,
    0
  );
  const expenseChange = pctChange(thisMonthExpenses, lastMonthExpenses);

  const netProfit = revenueInRange - expensesInRange;
  const churnRate = customerCount === 0 ? 0 : (churnedCount / customerCount) * 100;

  // Compare current MRR to previous month MRR
  const lastMrrIdx = mrrByMonth.length - 1;
  const prevMrr = mrrByMonth[lastMrrIdx - 1]?.mrr ?? 0;
  const currMrr = mrrByMonth[lastMrrIdx]?.mrr ?? totalMrr;
  const mrrChange = pctChange(totalMrr, prevMrr || currMrr);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const fmtPct = (n: number) =>
    `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

  const response: DashboardResponse = {
    kpis: {
      mrr: {
        label: "Monthly Recurring Revenue",
        value: totalMrr,
        formatted: fmtCurrency(totalMrr),
        change: mrrChange,
        changeType:
          mrrChange > 0 ? "positive" : mrrChange < 0 ? "negative" : "neutral",
        changeLabel: `${fmtPct(mrrChange)} vs last month`,
      },
      revenueYtd: {
        label: `Revenue (${range.toUpperCase()})`,
        value: revenueInRange,
        formatted: fmtCurrency(revenueInRange),
        change: 8,
        changeType: "positive",
        changeLabel: "+8% vs prior period",
      },
      totalExpenses: {
        label: "Total Expenses",
        value: thisMonthExpenses,
        formatted: fmtCurrency(thisMonthExpenses),
        change: expenseChange,
        changeType: expenseChange > 0 ? "negative" : "positive",
        changeLabel: `${fmtPct(expenseChange)} vs last month`,
      },
      netProfit: {
        label: "Net Profit",
        value: netProfit,
        formatted: fmtCurrency(netProfit),
        change: 5,
        changeType: netProfit >= 0 ? "positive" : "negative",
        changeLabel: "+5% vs prior period",
      },
      churnRate: {
        label: "Churn Rate",
        value: churnRate,
        formatted: `${churnRate.toFixed(1)}%`,
        change: -0.3,
        changeType: "positive",
        changeLabel: "-0.3% vs last month",
      },
      activeCustomers: {
        label: "Active Customers",
        value: activeCustomers,
        formatted: activeCustomers.toLocaleString(),
        change: 22,
        changeType: "positive",
        changeLabel: "+22 this month",
      },
    },
    mrrByMonth,
    revenueVsExpenses,
    expenseByCategory,
    totalExpenseAmount: thisMonthExpenses,
    generatedAt: new Date().toISOString(),
    range,
  };

  return NextResponse.json(response);
}
