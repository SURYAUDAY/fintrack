import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AIInsightsBannerProps {
  onExplain?: () => void;
}

export function AIInsightsBanner({ onExplain }: AIInsightsBannerProps) {
  return (
    <div className="rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-purple-50 p-5 dark:border-brand-600/20 dark:from-brand-600/5 dark:to-purple-600/5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-900">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              AI Insights
            </h3>
            <p className="mt-0.5 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Click &ldquo;Explain my data&rdquo; to get AI-powered insights about
              your current metrics, anomalies, and growth opportunities.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onExplain}
          className="border-brand-200 text-brand-700 hover:bg-white dark:border-brand-600/30 dark:text-brand-300"
        >
          Explain my data
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
