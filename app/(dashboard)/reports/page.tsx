"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { QueryBar } from "@/components/ai/QueryBar";
import {
  QueryResult,
  type QueryResultData,
} from "@/components/ai/QueryResult";
import { ReportGenerator } from "@/components/ai/ReportGenerator";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlanGate } from "@/components/ui/PlanGate";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runQuery = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Query failed");
      }
      if (json.error) {
        setError(json.error);
        setResult(null);
      } else {
        setResult(json as QueryResultData);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Query failed";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Reports
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ask AI questions about your data, or generate a monthly report.
        </p>
      </div>

      <PlanGate requiredPlan="PRO" feature="AI Query">
        <QueryBar onSubmit={runQuery} loading={loading} />
      </PlanGate>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          {error}
        </div>
      )}

      {!result && !error && (
        <EmptyState
          icon={<Search className="h-7 w-7" />}
          title="Your insights will appear here"
          description="Try one of the example queries above to get started."
        />
      )}

      {result && <QueryResult result={result} />}

      <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
        <PlanGate requiredPlan="PRO" feature="Report Generator">
          <ReportGenerator />
        </PlanGate>
      </div>
    </div>
  );
}
