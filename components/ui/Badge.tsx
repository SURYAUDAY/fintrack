import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeColor =
  | "blue"
  | "purple"
  | "green"
  | "red"
  | "orange"
  | "teal"
  | "gray"
  | "amber";

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  green:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  gray: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export function Badge({ color = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

const CATEGORY_COLOR_MAP: Record<string, BadgeColor> = {
  SaaS: "blue",
  Infrastructure: "purple",
  Marketing: "orange",
  Consulting: "teal",
  Payroll: "blue",
  "SaaS Tools": "teal",
  Product: "purple",
  Other: "gray",
};

export function CategoryBadge({ category }: { category: string }) {
  return <Badge color={CATEGORY_COLOR_MAP[category] ?? "gray"}>{category}</Badge>;
}

export function PlanBadge({ plan }: { plan: "FREE" | "PRO" | "ENTERPRISE" }) {
  const map: Record<string, BadgeColor> = {
    FREE: "gray",
    PRO: "blue",
    ENTERPRISE: "purple",
  };
  return <Badge color={map[plan]}>{plan}</Badge>;
}

export function StatusBadge({
  status,
}: {
  status: "ACTIVE" | "CHURNED" | "INACTIVE";
}) {
  const map: Record<string, BadgeColor> = {
    ACTIVE: "green",
    CHURNED: "red",
    INACTIVE: "gray",
  };
  return (
    <Badge color={map[status]}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

export function RoleBadge({
  role,
}: {
  role: "ADMIN" | "MANAGER" | "VIEWER";
}) {
  const map: Record<string, BadgeColor> = {
    ADMIN: "purple",
    MANAGER: "blue",
    VIEWER: "gray",
  };
  return <Badge color={map[role]}>{role}</Badge>;
}

export function TypeBadge({ type }: { type: "INCOME" | "EXPENSE" }) {
  return (
    <Badge color={type === "INCOME" ? "green" : "red"}>
      {type === "INCOME" ? "Income" : "Expense"}
    </Badge>
  );
}
