"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  TrendingUp,
  CreditCard,
  Users,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { cn, getInitials } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Revenue", href: "/revenue", icon: TrendingUp },
  { label: "Expenses", href: "/expenses", icon: CreditCard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

const STORAGE_KEY = "fintrack-sidebar-collapsed";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900",
          collapsed ? "w-16" : "w-60",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          {collapsed ? <Logo showWordmark={false} size="sm" /> : <Logo size="sm" />}
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 md:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Main menu
            </p>
          )}

          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "group relative flex h-[52px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                      active
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-300"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 h-8 w-[3px] rounded-r-full bg-brand-600" />
                    )}
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}

            {isAdmin && (
              <li>
                <Link
                  href="/admin/users"
                  onClick={onMobileClose}
                  className={cn(
                    "group relative flex h-[52px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                    pathname.startsWith("/admin")
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                  )}
                  title={collapsed ? "Users" : undefined}
                >
                  {pathname.startsWith("/admin") && (
                    <span className="absolute left-0 top-2 h-8 w-[3px] rounded-r-full bg-brand-600" />
                  )}
                  <Users2 className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>Users</span>}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2",
              collapsed && "justify-center"
            )}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {getInitials(session?.user.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {session?.user.name ?? "Loading…"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {session?.user.role
                    ? session.user.role.charAt(0) +
                      session.user.role.slice(1).toLowerCase()
                    : ""}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
