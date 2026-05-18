import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  changeLabel: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  accent?: string;
}

export function KPICard({
  label,
  value,
  changeLabel,
  changeType,
  icon: Icon,
  accent = "#3B5BDB",
}: KPICardProps) {
  const ChangeIcon =
    changeType === "negative" ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${accent}15`, color: accent }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p
        className={cn(
          "mt-2 flex items-center gap-1 text-[13px] font-medium",
          changeType === "positive" && "text-green-600 dark:text-green-400",
          changeType === "negative" && "text-red-600 dark:text-red-400",
          changeType === "neutral" && "text-slate-500"
        )}
      >
        {changeType !== "neutral" && (
          <ChangeIcon className="h-3.5 w-3.5" aria-hidden />
        )}
        <span>{changeLabel}</span>
      </p>
    </div>
  );
}
