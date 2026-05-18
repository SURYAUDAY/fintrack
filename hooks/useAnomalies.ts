"use client";

import { useQuery } from "@tanstack/react-query";

export interface Anomaly {
  month: string;
  direction: "spike" | "dip";
  percentFromMean: number;
  zScore: number;
  explanation: string;
}

interface SeriesPoint {
  month: string;
  value: number;
}

export function useAnomalies(
  series: SeriesPoint[] | undefined,
  metric: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["anomalies", metric, series],
    queryFn: async () => {
      const res = await fetch("/api/ai/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series, metric }),
      });
      if (!res.ok) throw new Error("Failed to detect anomalies");
      return ((await res.json()) as { anomalies: Anomaly[] }).anomalies;
    },
    enabled: enabled && !!series && series.length >= 3,
    staleTime: 5 * 60_000,
  });
}
