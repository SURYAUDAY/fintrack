import Link from "next/link";
import { Check, Clock, Headphones, RefreshCw, Shield, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
  features: { included: boolean; label: string; ai?: boolean }[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For individuals getting started",
    cta: "Get started free",
    ctaHref: "/register",
    features: [
      { included: true, label: "Up to 100 transactions/month" },
      { included: true, label: "Basic dashboard" },
      { included: true, label: "3 months history" },
      { included: true, label: "CSV export" },
      { included: false, label: "AI insights", ai: true },
      { included: false, label: "Natural language queries", ai: true },
      { included: false, label: "Report generator", ai: true },
      { included: false, label: "Custom date ranges" },
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing businesses",
    cta: "Sign up",
    ctaHref: "/register",
    highlighted: true,
    badge: "Most popular",
    features: [
      { included: true, label: "Unlimited transactions" },
      { included: true, label: "Full dashboard + all charts" },
      { included: true, label: "12 months history" },
      { included: true, label: "CSV import & export" },
      { included: true, label: "AI insights", ai: true },
      { included: true, label: "Natural language queries", ai: true },
      { included: true, label: "Report generator", ai: true },
      { included: true, label: "Custom date ranges" },
    ],
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For teams and organizations",
    cta: "Sign up",
    ctaHref: "/register",
    features: [
      { included: true, label: "Everything in Pro" },
      { included: true, label: "Multi-user access" },
      { included: true, label: "RBAC (3 user roles)" },
      { included: true, label: "Priority support" },
      { included: true, label: "Custom report branding" },
      { included: true, label: "API access" },
      { included: true, label: "SSO (Google, SAML)" },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <p className="mb-6 text-center text-sm font-medium text-slate-500">
            All plans include
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Inclusion icon={<Shield className="h-5 w-5" />} label="Bank-level security" />
            <Inclusion icon={<Clock className="h-5 w-5" />} label="99.9% uptime SLA" />
            <Inclusion icon={<Headphones className="h-5 w-5" />} label="Email support" />
            <Inclusion icon={<RefreshCw className="h-5 w-5" />} label="Daily backups" />
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-3">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Frequently asked questions
          </h2>
          <FAQ
            q="Can I upgrade or downgrade anytime?"
            a="Yes — change your plan whenever your needs change. We pro-rate the difference."
          />
          <FAQ
            q="Is my data secure?"
            a="All connections use TLS 1.3, data at rest is encrypted with AES-256, and we run daily encrypted backups."
          />
          <FAQ
            q="Do you offer annual billing?"
            a="Yes. Annual billing on Pro and Enterprise plans saves you 17% (two months free)."
          />
        </div>
      </main>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={
        "relative rounded-2xl border bg-white p-8 shadow-card dark:bg-slate-900 " +
        (plan.highlighted
          ? "border-2 border-brand-600 shadow-lg dark:border-brand-500"
          : "border-slate-200 dark:border-slate-800")
      }
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {plan.badge}
        </span>
      )}
      <h3
        className={
          "text-lg font-semibold " +
          (plan.highlighted
            ? "text-brand-600"
            : "text-slate-900 dark:text-slate-100")
        }
      >
        {plan.name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className={
            "text-5xl font-bold " +
            (plan.highlighted
              ? "text-brand-600"
              : "text-slate-900 dark:text-slate-100")
          }
        >
          {plan.price}
        </span>
        <span className="text-sm text-slate-500">{plan.period}</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">{plan.description}</p>

      <div className="my-6 h-px bg-slate-200 dark:bg-slate-800" />

      <ul className="space-y-3">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {f.included ? (
              <Check
                className={
                  "mt-0.5 h-4 w-4 flex-shrink-0 " +
                  (f.ai ? "text-brand-600" : "text-green-600")
                }
              />
            ) : (
              <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300" />
            )}
            <span
              className={
                f.included
                  ? "text-slate-700 dark:text-slate-300"
                  : "text-slate-400"
              }
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        className={
          "mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium transition " +
          (plan.highlighted
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800")
        }
      >
        {plan.cta}
      </Link>
    </div>
  );
}

function Inclusion({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      <span className="text-brand-600">{icon}</span>
      {label}
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <summary className="cursor-pointer text-sm font-medium text-slate-900 group-open:text-brand-600 dark:text-slate-100">
        {q}
      </summary>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{a}</p>
    </details>
  );
}
