import type { Plan, Role } from "@prisma/client";

export type Permission =
  | "READ_DATA"
  | "WRITE_DATA"
  | "DELETE_DATA"
  | "EXPORT_DATA"
  | "USE_AI"
  | "MANAGE_USERS";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "READ_DATA",
    "WRITE_DATA",
    "DELETE_DATA",
    "EXPORT_DATA",
    "USE_AI",
    "MANAGE_USERS",
  ],
  MANAGER: ["READ_DATA", "WRITE_DATA", "DELETE_DATA", "EXPORT_DATA", "USE_AI"],
  VIEWER: ["READ_DATA"],
};

const PLAN_GATED: Record<Permission, Plan[]> = {
  READ_DATA: ["FREE", "PRO", "ENTERPRISE"],
  WRITE_DATA: ["FREE", "PRO", "ENTERPRISE"],
  DELETE_DATA: ["FREE", "PRO", "ENTERPRISE"],
  EXPORT_DATA: ["PRO", "ENTERPRISE"],
  USE_AI: ["PRO", "ENTERPRISE"],
  MANAGE_USERS: ["FREE", "PRO", "ENTERPRISE"],
};

export function canDo(
  role: Role | undefined,
  permission: Permission,
  plan: Plan = "FREE"
): boolean {
  if (!role) return false;
  const roleAllowed = ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  const planAllowed = PLAN_GATED[permission].includes(plan);
  return roleAllowed && planAllowed;
}

export function planRequiredFor(permission: Permission): Plan {
  const plans = PLAN_GATED[permission];
  return plans.includes("FREE")
    ? "FREE"
    : plans.includes("PRO")
    ? "PRO"
    : "ENTERPRISE";
}
