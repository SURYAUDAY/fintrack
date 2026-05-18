"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Anomaly } from "@/hooks/useAnomalies";

interface InsightsPanelProps {
  open: boolean;
  onClose: () => void;
  metrics: {
    mrr: number;
    revenue: number;
    expenses: number;
    netProfit: number;
    churnRate: number;
    activeCustomers: number;
    mrrGrowth?: number;
  } | null;
  anomalies?: Anomaly[];
}

export function InsightsPanel({
  open,
  onClose,
  metrics,
  anomalies,
}: InsightsPanelProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && metrics && !text && !loading) {
      void run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const run = async () => {
    if (!metrics) return;
    setText("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "AI insights failed");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value);
        setText(acc);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const bullets = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[•\-*]\s*/, ""));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-900",
          open ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              AI Insights
            </h3>
            <span className="text-xs text-slate-400">Powered by GPT-4o-mini</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {loading && bullets.length === 0 && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="skeleton h-4 w-full"
                  style={{ width: `${85 - i * 8}%` }}
                />
              ))}
              <p className="mt-2 text-xs text-slate-500">
                Analyzing your data
                <span className="inline-flex">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse [animation-delay:.2s]">.</span>
                  <span className="animate-pulse [animation-delay:.4s]">.</span>
                </span>
              </p>
            </div>
          )}

          {bullets.length > 0 && (
            <ul className="space-y-3">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">
                    <span className="text-xs font-semibold">{i + 1}</span>
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {bullet}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {anomalies && anomalies.length > 0 && (
            <section className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Anomalies detected
                </h4>
              </div>
              <ul className="space-y-2">
                {anomalies.map((a) => (
                  <li
                    key={a.month}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <span className="font-semibold">
                      {a.direction === "spike" ? "↑" : "↓"} {a.month}
                    </span>{" "}
                    — {a.explanation}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={run}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
