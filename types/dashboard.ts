export type DateRange = "7d" | "30d" | "90d" | "ytd";

export interface KpiMetric {
  label: string;
  value: number;
  formatted: string;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  changeLabel: string;
}

export interface DashboardKpis {
  mrr: KpiMetric;
  revenueYtd: KpiMetric;
  totalExpenses: KpiMetric;
  netProfit: KpiMetric;
  churnRate: KpiMetric;
  activeCustomers: KpiMetric;
}

export interface MrrPoint {
  month: string;
  mrr: number;
}

export interface RevenueExpensesPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseCategorySlice {
  name: string;
  value: number;
  color: string;
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  mrrByMonth: MrrPoint[];
  revenueVsExpenses: RevenueExpensesPoint[];
  expenseByCategory: ExpenseCategorySlice[];
  totalExpenseAmount: number;
  generatedAt: string;
  range: DateRange;
}
