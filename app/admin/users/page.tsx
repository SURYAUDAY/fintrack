"use client";

import { useState } from "react";
import { MailPlus, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { CustomerAvatar } from "@/components/ui/CustomerAvatar";
import { Badge, PlanBadge, RoleBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InviteUserModal } from "@/components/ui/InviteUserModal";
import {
  useDeactivateUser,
  useUpdateUser,
  useUsers,
  type Role,
  type UserRow,
} from "@/hooks/useUsers";
import { useSession } from "next-auth/react";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { data: users, isLoading } = useUsers();
  const updateMutation = useUpdateUser();
  const deactivateMutation = useDeactivateUser();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<UserRow | null>(null);

  const totalUsers = users?.length ?? 0;
  const adminCount = users?.filter((u) => u.role === "ADMIN").length ?? 0;
  const activeCount = users?.filter((u) => u.status === "ACTIVE").length ?? 0;

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateMutation.mutateAsync({ id, role });
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDeactivate = async () => {
    if (!deactivating) return;
    try {
      await deactivateMutation.mutateAsync(deactivating.id);
      toast.success(`${deactivating.email} deactivated`);
      setDeactivating(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deactivation failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            User management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage team access and permissions.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <MailPlus className="h-4 w-4" />
          Invite user
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total users" value={totalUsers.toString()} />
        <Stat label="Admins" value={adminCount.toString()} />
        <Stat label="Active" value={activeCount.toString()} />
      </div>

      {isLoading || !users ? (
        <TableSkeleton rows={3} cols={6} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Plan</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Last login
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = session?.user.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar name={u.name ?? u.email} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                              {u.name ?? u.email}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3">
                        <PlanBadge plan={u.plan} />
                      </td>
                      <td className="px-4 py-3">
                        {u.status === "ACTIVE" ? (
                          <Badge color="green">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                            Active
                          </Badge>
                        ) : (
                          <Badge color="gray">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {u.lastLoginAt
                          ? formatRelative(new Date(u.lastLoginAt))
                          : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="block text-right text-xs text-slate-400">
                            —
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  u.id,
                                  e.target.value as Role
                                )
                              }
                              disabled={u.status !== "ACTIVE"}
                              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs focus:border-brand-600 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="MANAGER">Manager</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                            {u.status === "ACTIVE" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeactivating(u)}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              >
                                Deactivate
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate user?"
        description={
          deactivating
            ? `${deactivating.email} will lose access until reactivated.`
            : ""
        }
        confirmLabel="Deactivate"
        destructive
        loading={deactivateMutation.isPending}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-[24px] font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
