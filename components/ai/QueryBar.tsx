"use client";

import { useState, type FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "MRR growth this year",
  "Top 5 expense categories",
  "Customers who joined last month",
  "Revenue vs expenses Q3",
];

interface QueryBarProps {
  onSubmit: (query: string) => void;
  loading?: boolean;
  className?: string;
}

export function QueryBar({ onSubmit, loading, className }: QueryBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleChip = (chip: string) => {
    setValue(chip);
    onSubmit(chip);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Ask your data anything
        </h2>
      </div>
      <p className="mb-5 text-sm text-slate-500">
        Type a question in plain English — FinTrack AI will find the answer.
      </p>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Show revenue from enterprise customers last quarter…"
          className="h-[52px] w-full rounded-xl border-2 border-slate-200 bg-white px-4 pr-28 text-base text-slate-900 placeholder:text-slate-400 transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <Button
          type="submit"
          loading={loading}
          disabled={!value.trim()}
          className="absolute right-1.5 top-1.5 h-10"
        >
          <Send className="h-4 w-4" />
          Ask
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Show me:</span>
        {EXAMPLES.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChip(chip)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-600/10 dark:hover:text-brand-300"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
