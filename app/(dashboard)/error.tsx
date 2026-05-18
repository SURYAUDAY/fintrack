"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/60 p-8 dark:border-red-900/50 dark:bg-red-950/30">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
            This section failed to load
          </h2>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
            {process.env.NODE_ENV === "development"
              ? error.message
              : "An unexpected error occurred. The rest of the app is still available."}
          </p>
          {error.digest && (
            <p className="mt-1 font-mono text-xs text-red-600/70 dark:text-red-400/70">
              ref: {error.digest}
            </p>
          )}
          <Button onClick={reset} className="mt-4" variant="outline">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
