"use client";

import { useSession } from "next-auth/react";
import { canDo, type Permission } from "@/lib/permissions";

export function usePermission(permission: Permission): boolean {
  const { data: session } = useSession();
  if (!session?.user) return false;
  return canDo(session.user.role, permission, session.user.plan);
}
