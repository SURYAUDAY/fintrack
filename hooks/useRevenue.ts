"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export interface RevenueFilters {
  search?: string;
  category?: string;
  type?: "INCOME" | "EXPENSE" | "all";
  sortBy?: "date" | "amount" | "category";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface TransactionRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "INCOME" | "EXPENSE";
  userId: string;
}

interface RevenueResponse {
  data: TransactionRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildQuery(filters: RevenueFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category && filters.category !== "all")
    params.set("category", filters.category);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

export function useRevenue(filters: RevenueFilters) {
  return useQuery({
    queryKey: ["revenue", filters],
    queryFn: async () => {
      const res = await fetch(`/api/revenue?${buildQuery(filters)}`);
      if (!res.ok) throw new Error("Failed to load transactions");
      return (await res.json()) as RevenueResponse;
    },
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TransactionRow, "id" | "userId">) => {
      const res = await fetch("/api/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Could not create transaction");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revenue"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<TransactionRow> & { id: string }) => {
      const res = await fetch(`/api/revenue/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Could not update transaction");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revenue"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/revenue/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete transaction");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revenue"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBulkImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Omit<TransactionRow, "id" | "userId">[]) => {
      const res = await fetch("/api/revenue/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Bulk import failed");
      }
      return (await res.json()) as { inserted: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["revenue"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
