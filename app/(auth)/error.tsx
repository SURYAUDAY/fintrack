"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AuthError({
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Sign-in is temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Please try again in a moment."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
