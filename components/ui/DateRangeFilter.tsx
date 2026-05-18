"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types/dashboard";

const RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (next: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span>
          Last{" "}
          {value === "7d"
            ? "7 days"
            : value === "30d"
            ? "30 days"
            : value === "90d"
            ? "90 days"
            : "year to date"}
        </span>
      </div>
      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
        {RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            className={cn(
              "h-8 rounded-md px-3 text-xs font-medium transition",
              value === r.value
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
