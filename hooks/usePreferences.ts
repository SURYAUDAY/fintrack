"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export interface Preferences {
  theme?: "light" | "dark";
  monthlyBudget?: number;
  currency?: string;
  dateFormat?: string;
}

export function usePreferences() {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      const res = await fetch("/api/settings/preferences");
      if (!res.ok) throw new Error("Failed to load preferences");
      return ((await res.json()) as { data: Preferences }).data;
    },
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Preferences) => {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Update failed");
      return (await res.json()) as { data: Preferences };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["preferences"] }),
  });
}
