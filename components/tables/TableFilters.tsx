"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TableFilterValue {
  search: string;
  category: string;
  type: "all" | "INCOME" | "EXPENSE";
}

interface TableFiltersProps {
  value: TableFilterValue;
  onChange: (next: TableFilterValue) => void;
  categories: string[];
  resultCount?: number;
  className?: string;
}

export function TableFilters({
  value,
  onChange,
  categories,
  resultCount,
  className,
}: TableFiltersProps) {
  const [searchInput, setSearchInput] = useState(value.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== value.search) {
        onChange({ ...value, search: searchInput });
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center",
        className
      )}
    >
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search transactions…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <select
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-900"
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={value.type}
        onChange={(e) =>
          onChange({
            ...value,
            type: e.target.value as TableFilterValue["type"],
          })
        }
        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-900"
      >
        <option value="all">All types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      {typeof resultCount === "number" && (
        <p className="ml-auto text-xs text-slate-500">
          Showing <span className="font-medium">{resultCount}</span>{" "}
          transactions
        </p>
      )}
    </div>
  );
}
