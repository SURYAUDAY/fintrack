"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useInviteUser, type Role } from "@/hooks/useUsers";

interface InviteFormValues {
  email: string;
  name: string;
  role: Role;
}

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  VIEWER: "Can view all data, no edits.",
  MANAGER: "Can add and edit data; cannot manage users.",
  ADMIN: "Full access including user management.",
};

export function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const inviteMutation = useInviteUser();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({
    defaultValues: { email: "", name: "", role: "VIEWER" },
  });

  const selectedRole = watch("role");

  const handleClose = () => {
    reset();
    setTempPassword(null);
    setInvitedEmail(null);
    onClose();
  };

  const onSubmit = async (values: InviteFormValues) => {
    try {
      const result = await inviteMutation.mutateAsync(values);
      setTempPassword(result.tempPassword);
      setInvitedEmail(result.user.email);
      toast.success("User invited");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={tempPassword ? "User invited" : "Invite team member"}
      width="md"
    >
      {tempPassword ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Account created for{" "}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {invitedEmail}
            </span>
            . Share this temporary password with them — it won&apos;t be shown
            again.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/40">
            <code className="flex-1 font-mono text-sm text-slate-900 dark:text-slate-100">
              {tempPassword}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                toast.success("Copied to clipboard");
              }}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              aria-label="Copy"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={handleClose} fullWidth>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="colleague@company.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
            })}
          />
          <Input
            label="Name (optional)"
            placeholder="Jane Doe"
            {...register("name")}
          />
          <Select label="Role" {...register("role", { required: true })}>
            <option value="VIEWER">Viewer</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <p className="text-xs text-slate-500">
            {ROLE_DESCRIPTIONS[selectedRole]}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Send invite
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
