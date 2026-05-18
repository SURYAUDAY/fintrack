"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const SECTION_BORDERS: Record<string, string> = {
  "Executive Summary": "border-blue-500",
  "Revenue Analysis": "border-green-500",
  "Expense Analysis": "border-orange-500",
  "Customer Highlights": "border-purple-500",
  "Key Risks": "border-red-500",
  Recommendations: "border-teal-500",
};

interface ReportData {
  markdown: string;
  monthLabel: string;
}

export function ReportGenerator() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  const monthOptions = useMemo(() => {
    const options: { label: string; month: number; year: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Report generation failed");
      }
      const json = await res.json();
      setReport({ markdown: json.markdown, monthLabel: json.monthLabel });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!report) return;
    const txt = `FinTrack Monthly Report — ${report.monthLabel}\nGenerated ${new Date().toLocaleString()}\n\n${report.markdown.replace(/##\s+/g, "\n").replace(/\*\*/g, "")}`;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinTrack-Report-${report.monthLabel.replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Generate monthly report
          </h3>
        </div>
        <select
          value={`${year}-${month}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split("-").map(Number);
            setYear(y);
            setMonth(m);
          }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {monthOptions.map((o) => (
            <option key={o.label} value={`${o.year}-${o.month}`}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="max-w-xl text-sm text-slate-500">
        Get an AI-written summary of your financial performance for the selected
        month, ready to share with stakeholders.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={generate} loading={loading}>
          Generate report
        </Button>
        <Button variant="outline" disabled={!report} onClick={download}>
          <Download className="h-4 w-4" />
          Download .txt
        </Button>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400">
          <Sparkles className="h-3 w-3" />
          Powered by GPT-4o-mini
        </span>
      </div>

      {loading && (
        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      )}

      {report && (
        <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              FinTrack Monthly Report — {report.monthLabel}
            </h4>
            <p className="text-xs text-slate-500">
              Generated {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="space-y-4">
            <ReactMarkdown
              components={{
                h2: ({ children }) => {
                  const text =
                    typeof children === "string"
                      ? children
                      : Array.isArray(children)
                      ? children.join("")
                      : "";
                  const border =
                    SECTION_BORDERS[String(text).trim()] ?? "border-slate-300";
                  return (
                    <h2
                      className={cn(
                        "border-l-4 pl-3 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200",
                        border
                      )}
                    >
                      {children}
                    </h2>
                  );
                },
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {children}
                  </ul>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    {children}
                  </strong>
                ),
              }}
            >
              {report.markdown}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
