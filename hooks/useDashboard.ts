"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardResponse, DateRange } from "@/types/dashboard";

async function fetchDashboard(range: DateRange): Promise<DashboardResponse> {
  const res = await fetch(`/api/dashboard?range=${range}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Dashboard request failed: ${res.status}`);
  }
  return (await res.json()) as DashboardResponse;
}

export function useDashboard(range: DateRange) {
  return useQuery({
    queryKey: ["dashboard", range],
    queryFn: () => fetchDashboard(range),
    staleTime: 60_000,
  });
}
