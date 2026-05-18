"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export type Plan = "FREE" | "PRO" | "ENTERPRISE";
export type CustomerStatus = "ACTIVE" | "CHURNED";
export type ChurnRisk = "LOW" | "MEDIUM" | "HIGH";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  mrr: number;
  status: CustomerStatus;
  churnRisk: ChurnRisk;
  joinedAt: string;
  churnedAt: string | null;
}

export interface CustomersFilters {
  search?: string;
  plan?: Plan | "all";
  status?: CustomerStatus | "all";
  sortBy?: "mrr" | "joinedAt" | "name";
  sortDir?: "asc" | "desc";
}

interface CustomersResponse {
  data: CustomerRow[];
  summary: {
    total: number;
    active: number;
    totalMrr: number;
    arpu: number;
  };
}

export interface CustomerDetail extends CustomerRow {
  mrrHistory: { month: string; mrr: number }[];
}

export function useCustomers(filters: CustomersFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.plan && filters.plan !== "all") params.set("plan", filters.plan);
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);

  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => {
      const res = await fetch(`/api/customers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load customers");
      return (await res.json()) as CustomersResponse;
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) throw new Error("Failed to load customer");
      const json = await res.json();
      return json.data as CustomerDetail;
    },
    enabled: !!id,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<CustomerRow> & { id: string }) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Could not update customer");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customer"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
