"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface State {
  hasError: boolean;
  message?: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error);
    }
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm dark:border-red-900/50 dark:bg-red-950/40">
          <p className="font-semibold text-red-700 dark:text-red-300">
            Something went wrong
          </p>
          {process.env.NODE_ENV === "development" && this.state.message && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {this.state.message}
            </p>
          )}
          <Button onClick={this.reset} className="mt-4" variant="outline">
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
