"use client";

import { useState } from "react";
import { Pencil, Plus, Repeat, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge, CategoryBadge } from "@/components/ui/Badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { BudgetVsActualChart } from "@/components/charts/BudgetVsActualChart";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
  type ExpenseRow,
} from "@/hooks/useExpenses";
import { usePermission } from "@/hooks/usePermission";
import { cn, formatCurrency } from "@/lib/utils";

const CATEGORIES = ["Payroll", "Infrastructure", "Marketing", "SaaS Tools", "Other"];

export default function ExpensesPage() {
  const canWrite = usePermission("WRITE_DATA");
  const canDelete = usePermission("DELETE_DATA");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data, isLoading } = useExpenses(
    activeCategory !== "all" ? { category: activeCategory } : {}
  );
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [deleting, setDeleting] = useState<ExpenseRow | null>(null);

  const monthlyBudget = 50_000; // From settings in Phase 14
  const thisMonthTotal =
    data?.totals.reduce((sum, t) => sum + t.total, 0) ?? 0;
  const recurringTotal =
    data?.data.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0) ??
    0;

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (row: ExpenseRow) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSave = async (values: {
    description: string;
    amount: number;
    category: string;
    date: string;
    recurring: boolean;
    frequency: string | null;
  }) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...values });
        toast.success("Expense updated");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Expense added");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast.success("Expense deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Expenses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage all business expenses.
          </p>
        </div>
        {canWrite && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add expense
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="This month"
          value={formatCurrency(thisMonthTotal)}
          hint={`${
            ((thisMonthTotal / monthlyBudget) * 100).toFixed(0)
          }% of budget`}
        />
        <SummaryCard
          label="Budget remaining"
          value={formatCurrency(Math.max(0, monthlyBudget - thisMonthTotal))}
          hint={`of ${formatCurrency(monthlyBudget)} budget`}
        />
        <SummaryCard
          label="Recurring expenses"
          value={formatCurrency(recurringTotal)}
          hint={`${
            thisMonthTotal === 0
              ? 0
              : Math.round((recurringTotal / thisMonthTotal) * 100)
          }% of total`}
        />
      </div>

      {/* Budget chart */}
      {isLoading || !data ? (
        <ChartSkeleton />
      ) : (
        <ChartCard title="Monthly budget vs actual" subtitle="Last 12 months">
          <BudgetVsActualChart data={data.monthly} budget={monthlyBudget} />
        </ChartCard>
      )}

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <CategoryPill
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        >
          All
        </CategoryPill>
        {CATEGORIES.map((c) => (
          <CategoryPill
            key={c}
            active={activeCategory === c}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </CategoryPill>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : !data?.data.length ? (
        <EmptyState
          title="No expenses yet"
          description="Add your first expense to start tracking."
          actions={
            canWrite ? <Button onClick={handleAdd}>Add expense</Button> : null
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Recurring</th>
                  {(canWrite || canDelete) && (
                    <th className="px-4 py-3 text-right font-medium" />
                  )}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:bg-brand-600/5"
                  >
                    <td className="px-4 py-3">
                      {new Date(row.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {row.description}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={row.category} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {row.recurring ? (
                        <Badge color="green">
                          <Repeat className="mr-1 h-3 w-3" />
                          {row.frequency ?? "Recurring"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">One-time</span>
                      )}
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {canWrite && (
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleting(row)}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category totals */}
      {data?.totals && data.totals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.totals.map((t) => (
            <div
              key={t.category}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t.category}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(t.total)}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-brand-600"
                  style={{
                    width: `${Math.min(
                      100,
                      thisMonthTotal === 0
                        ? 0
                        : (t.total / thisMonthTotal) * 100
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {t.count} transaction{t.count === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      )}

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        defaultValues={editing}
        categories={CATEGORIES}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete expense?"
        description={
          deleting
            ? `"${deleting.description}" will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-[24px] font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function CategoryPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-medium transition",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      )}
    >
      {children}
    </button>
  );
}
