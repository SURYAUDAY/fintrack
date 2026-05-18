"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { CustomerAvatar } from "@/components/ui/CustomerAvatar";
import { RoleBadge } from "@/components/ui/Badge";
import { useTheme } from "@/components/layout/ThemeProvider";
import {
  usePreferences,
  useUpdatePreferences,
} from "@/hooks/usePreferences";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { data: preferences } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and preferences.
        </p>
      </div>

      <ProfileSection
        defaultName={session?.user.name ?? ""}
        email={session?.user.email ?? ""}
        role={session?.user.role}
        onSaved={async () => {
          await update?.();
        }}
      />

      <PasswordSection />

      <PreferencesSection
        currentBudget={Number(preferences?.monthlyBudget ?? 50000)}
        themeChecked={theme === "dark"}
        onThemeChange={(next) => setTheme(next ? "dark" : "light")}
        onSave={async (vals) => {
          await updatePrefs.mutateAsync(vals);
          toast.success("Preferences saved");
        }}
      />
    </div>
  );
}

function ProfileSection({
  defaultName,
  email,
  role,
  onSaved,
}: {
  defaultName: string;
  email: string;
  role?: "ADMIN" | "MANAGER" | "VIEWER";
  onSaved: () => Promise<void> | void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string }>({
    defaultValues: { name: defaultName },
  });

  const onSubmit = async (values: { name: string }) => {
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      toast.error("Could not save profile");
      return;
    }
    await onSaved();
    toast.success("Profile updated");
  };

  return (
    <Card title="Profile">
      <div className="mb-6 flex items-center gap-4">
        <CustomerAvatar name={defaultName || email} size="lg" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Input
          label="Full name"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            minLength: { value: 2, message: "At least 2 characters" },
          })}
        />
        <div className="space-y-1.5">
          <Input
            label="Email address"
            value={email}
            disabled
            readOnly
            className="bg-slate-50 dark:bg-slate-800"
          />
          <p className="text-xs text-slate-500">Email cannot be changed.</p>
        </div>
        {role && (
          <div>
            <p className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Role
            </p>
            <RoleBadge role={role} />
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const onSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const res = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? "Could not change password");
      return;
    }
    toast.success("Password updated");
    reset();
  };

  return (
    <Card title="Security">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="password"
          label="Current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword", {
            required: "Current password is required",
          })}
        />
        <Input
          type="password"
          label="New password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 8, message: "At least 8 characters" },
          })}
        />
        <Input
          type="password"
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your new password",
          })}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </div>
      </form>

    </Card>
  );
}

function PreferencesSection({
  currentBudget,
  themeChecked,
  onThemeChange,
  onSave,
}: {
  currentBudget: number;
  themeChecked: boolean;
  onThemeChange: (next: boolean) => void;
  onSave: (vals: { monthlyBudget?: number }) => Promise<void>;
}) {
  const [budget, setBudget] = useState(String(currentBudget));

  return (
    <Card title="Preferences">
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        <Row
          label="Dark mode"
          hint="Use dark theme across the app"
          control={<Toggle checked={themeChecked} onChange={onThemeChange} />}
        />

        <Row
          label="Monthly expense budget"
          hint="Used by the expenses page chart"
          control={
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-9 w-32 rounded-lg border border-slate-200 bg-white pl-6 pr-3 text-sm focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <Button
                size="sm"
                onClick={() =>
                  onSave({ monthlyBudget: Number(budget) || 0 })
                }
              >
                Save
              </Button>
            </div>
          }
        />
      </div>
    </Card>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="border-b border-slate-200 pb-3 text-base font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      {control}
    </div>
  );
}
