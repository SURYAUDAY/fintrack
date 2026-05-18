"use client";

import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Badge, PlanBadge, StatusBadge } from "@/components/ui/Badge";
import { CustomerAvatar } from "@/components/ui/CustomerAvatar";
import { CustomerDetailDrawer } from "@/components/ui/CustomerDetailDrawer";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useCustomers,
  useUpdateCustomer,
  type CustomersFilters,
} from "@/hooks/useCustomers";
import { usePermission } from "@/hooks/usePermission";
import { cn, formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const canWrite = usePermission("WRITE_DATA");

  const [filters, setFilters] = useState<CustomersFilters>({
    plan: "all",
    status: "all",
    sortBy: "mrr",
    sortDir: "desc",
  });

  const { data, isLoading } = useCustomers(filters);
  const updateMutation = useUpdateCustomer();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleMarkChurned = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: "CHURNED" });
      toast.success("Customer marked as churned");
      setSelectedId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Customers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your customer base and track MRR.
          </p>
        </div>
        {canWrite && (
          <Button>
            <Plus className="h-4 w-4" />
            Add customer
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total customers"
          value={data?.summary.total.toLocaleString() ?? "—"}
          hint={`${data?.summary.active ?? 0} active`}
        />
        <SummaryCard
          label="Total MRR"
          value={
            data ? formatCurrency(data.summary.totalMrr) : "—"
          }
          hint="Active customers only"
        />
        <SummaryCard
          label="Average MRR / customer"
          value={data ? formatCurrency(data.summary.arpu) : "—"}
          hint="ARPU (active)"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <input
          type="search"
          placeholder="Search customers…"
          value={filters.search ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          className="h-9 flex-1 min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-900"
        />
        <select
          value={filters.plan}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              plan: e.target.value as CustomersFilters["plan"],
            }))
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: e.target.value as CustomersFilters["status"],
            }))
          }
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CHURNED">Churned</option>
        </select>
        <select
          value={`${filters.sortBy}-${filters.sortDir}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split("-") as [
              CustomersFilters["sortBy"],
              CustomersFilters["sortDir"],
            ];
            setFilters((f) => ({ ...f, sortBy, sortDir }));
          }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="mrr-desc">MRR (high to low)</option>
          <option value="mrr-asc">MRR (low to high)</option>
          <option value="joinedAt-desc">Most recent</option>
          <option value="name-asc">Name (A → Z)</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : !data?.data.length ? (
        <EmptyState
          title="No customers found"
          description="Try adjusting your filters or add a new customer."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-right font-medium">MRR</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Churn risk
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((c) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "border-t border-slate-100 transition hover:bg-brand-50/40 dark:border-slate-800 dark:hover:bg-brand-600/5",
                      c.churnRisk === "HIGH" &&
                        "bg-red-50/40 dark:bg-red-950/10"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={c.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {c.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={c.plan} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {c.mrr === 0
                        ? "—"
                        : `${formatCurrency(c.mrr)}/mo`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ChurnRiskCell risk={c.churnRisk} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(c.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedId(c.id)}
                      >
                        View details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CustomerDetailDrawer
        customerId={selectedId}
        onClose={() => setSelectedId(null)}
        onMarkChurned={handleMarkChurned}
        canEdit={canWrite}
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
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-[24px] font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function ChurnRiskCell({ risk }: { risk: "LOW" | "MEDIUM" | "HIGH" }) {
  if (risk === "HIGH")
    return (
      <Badge color="red">
        <AlertTriangle className="mr-1 h-3 w-3" />
        High
      </Badge>
    );
  if (risk === "MEDIUM") return <Badge color="amber">Medium</Badge>;
  return <Badge color="green">Low</Badge>;
}
