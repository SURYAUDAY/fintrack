"use client";

import { Children, cloneElement, isValidElement, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import type { Plan } from "@prisma/client";

const PLAN_RANK: Record<Plan, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

interface PlanGateProps {
  requiredPlan: Plan;
  feature: string;
  children: ReactNode;
}

export function PlanGate({
  requiredPlan,
  feature,
  children,
}: PlanGateProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const userPlan = session?.user.plan ?? "FREE";
  const allowed = PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];

  if (allowed) return <>{children}</>;

  // Wrap onClick handlers of immediate children to open the upgrade modal.
  const wrapped = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void;
    }>, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      },
    });
  });

  return (
    <>
      {wrapped}
      <UpgradeModal
        open={open}
        onClose={() => setOpen(false)}
        feature={feature}
      />
    </>
  );
}
