"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCustomer } from "@/hooks/useCustomers";
import { Badge, PlanBadge, StatusBadge } from "@/components/ui/Badge";
import { CustomerAvatar } from "@/components/ui/CustomerAvatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatCurrency } from "@/lib/utils";

interface CustomerDetailDrawerProps {
  customerId: string | null;
  onClose: () => void;
  onMarkChurned?: (id: string) => void;
  canEdit?: boolean;
}

export function CustomerDetailDrawer({
  customerId,
  onClose,
  onMarkChurned,
  canEdit,
}: CustomerDetailDrawerProps) {
  const { data: customer, isLoading } = useCustomer(customerId);
  const open = !!customerId;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-[420px] overflow-y-auto bg-white shadow-2xl transition-transform dark:bg-slate-900",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Customer details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading || !customer ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CustomerAvatar name={customer.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {customer.name}
                  </h3>
                  <p className="truncate text-sm text-slate-500">
                    {customer.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <PlanBadge plan={customer.plan} />
                    <StatusBadge status={customer.status} />
                    <ChurnRiskBadge risk={customer.churnRisk} />
                  </div>
                </div>
              </div>

              <section>
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  MRR history (last {customer.mrrHistory.length} months)
                </h4>
                {customer.mrrHistory.length > 0 ? (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={customer.mrrHistory}>
                        <XAxis
                          dataKey="month"
                          tickFormatter={(d) =>
                            new Date(d).toLocaleDateString("en-US", {
                              month: "short",
                            })
                          }
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          formatter={(v: number) => [formatCurrency(v), "MRR"]}
                          labelFormatter={(d) =>
                            new Date(d as string).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="mrr"
                          stroke="#3B5BDB"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No history yet.</p>
                )}
              </section>

              <section className="grid grid-cols-2 gap-4">
                <Stat label="Customer since">
                  {new Date(customer.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Stat>
                <Stat label="Current plan">{customer.plan}</Stat>
                <Stat label="Current MRR">{formatCurrency(customer.mrr)}</Stat>
                <Stat label="Lifetime MRR">
                  {formatCurrency(
                    customer.mrrHistory.reduce((s, m) => s + m.mrr, 0)
                  )}
                </Stat>
              </section>

              {canEdit && customer.status === "ACTIVE" && onMarkChurned && (
                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <Button
                    variant="danger"
                    onClick={() => onMarkChurned(customer.id)}
                    fullWidth
                  >
                    Mark as churned
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {children}
      </p>
    </div>
  );
}

function ChurnRiskBadge({ risk }: { risk: "LOW" | "MEDIUM" | "HIGH" }) {
  if (risk === "HIGH")
    return (
      <Badge color="red">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
        High risk
      </Badge>
    );
  if (risk === "MEDIUM")
    return (
      <Badge color="amber">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
        Medium risk
      </Badge>
    );
  return (
    <Badge color="green">
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
      Low risk
    </Badge>
  );
}
