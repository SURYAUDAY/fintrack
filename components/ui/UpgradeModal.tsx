"use client";

import Link from "next/link";
import { Check, Shield, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
}

const PRO_FEATURES = [
  "AI-powered data insights",
  "Natural language queries",
  "Automated report generation",
  "Unlimited transactions & history",
];

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  return (
    <Modal open={open} onClose={onClose} width="md">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-600/10">
          <Sparkles className="h-8 w-8 text-brand-600" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Unlock {feature}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          This feature is available on the Pro plan and above.
        </p>

        <div className="mt-6 rounded-xl bg-brand-50 p-4 text-left dark:bg-brand-600/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            Pro plan includes
          </p>
          <ul className="mt-3 space-y-2">
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
              >
                <Check className="h-4 w-4 text-brand-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/pricing" onClick={onClose} className="mt-6 block">
          <Button fullWidth>Upgrade to Pro — $29/month</Button>
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
        >
          Cancel
        </button>

        <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <Shield className="h-3 w-3" />
          30-day money-back guarantee &middot; Cancel anytime
        </p>
      </div>
    </Modal>
  );
}
