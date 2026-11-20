"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  RiDashboard3Line,
  RiFileList3Line,
  RiTranslate2,
  RiTeamLine,
  RiMegaphoneLine,
  RiFileShield2Line,
  RiTelegramLine,
  RiMenuLine,
  RiMoonLine,
  RiSunLine,
  RiArrowDownSLine,
  RiLogoutBoxRLine,
  RiGlobalLine,
  RiCloseLine,
  RiLoader4Line,
  RiBookOpenLine,
  RiSettings3Line,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/components/providers/AuthProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { cn } from "@/lib/utils";
import type { UserDTO } from "@/types";
import { AdminStatsOverview, type AdminStatsData } from "./AdminStatsOverview";
import { AdminOrdersManager } from "./AdminOrdersManager";
import { AdminServicesManager } from "./AdminServicesManager";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminBroadcastPanel } from "./AdminBroadcastPanel";
import { AdminAuditLogTable } from "./AdminAuditLogTable";
import { AdminTelegramPanel } from "./AdminTelegramPanel";
import { AdminSettingsPanel } from "./AdminSettingsPanel";

type AdminSection =
  | "overview"
  | "orders"
  | "services"
  | "users"
  | "broadcast"
  | "audit"
  | "telegram"
  | "settings";

export function AdminDashboardShell({
  initialAdmin,
}: {
  initialAdmin?: UserDTO | null;
}) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const adminUser = user ?? initialAdmin;

  const [section, setSection] = useState<AdminSection>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("lb_admin_dark");
    if (saved === "1") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lb_admin_dark", darkMode ? "1" : "0");
    document.documentElement.classList.toggle("dark", darkMode);
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [darkMode]);

  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as AdminStatsData;
        setStats(data);
      }
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const navItems: Array<{
    key: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: "overview", label: "Dashboard", icon: RiDashboard3Line },
    { key: "orders", label: t.admin.navOrders, icon: RiFileList3Line },
    { key: "services", label: t.admin.navServices, icon: RiTranslate2 },
    { key: "users", label: "Foydalanuvchilar", icon: RiTeamLine },
    { key: "broadcast", label: t.admin.navBroadcast, icon: RiMegaphoneLine },
    { key: "audit", label: t.admin.navAudit, icon: RiFileShield2Line },
    { key: "telegram", label: t.admin.navTelegram, icon: RiTelegramLine },
    { key: "settings", label: "Sozlamalar", icon: RiSettings3Line },
  ];

  const activeNav = navItems.find((i) => i.key === section) ?? navItems[0];
  const ActiveIcon = activeNav.icon;
  const activeTitle = section === "overview" ? "Admin Dashboard" : activeNav.label;

  const initials = `${adminUser?.firstName?.[0] || "A"}${adminUser?.lastName?.[0] || "D"}`.toUpperCase();

  return (
    <div
      className={cn(
        "min-h-screen flex transition-colors",
        darkMode ? "bg-slate-950 text-slate-100" : "bg-[#F4F7FA] text-slate-900"
      )}
    >
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-200 lg:static",
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200/80",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          mobileSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Box with Icon */}
        <div
          className={cn(
            "flex h-16 items-center justify-between px-4 border-b",
            darkMode ? "border-slate-800" : "border-slate-100"
          )}
        >
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00C896] text-white shadow-xs">
                <RiBookOpenLine className="h-5 w-5" />
              </div>
              <div className="leading-tight truncate">
                <p className="text-sm font-bold tracking-tight truncate">
                  Lingo Bridge
                </p>
                <p className="text-[11px] text-slate-400">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#00C896] text-white shadow-xs">
              <RiBookOpenLine className="h-5 w-5" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setSection(item.key);
                  setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer",
                  active
                    ? "bg-[#00C896] text-white shadow-md shadow-[#00C896]/25"
                    : darkMode
                      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  sidebarCollapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom quick link back to website */}
        <div
          className={cn(
            "p-3 border-t",
            darkMode ? "border-slate-800" : "border-slate-100"
          )}
        >
          <Link
            href="/"
            title={sidebarCollapsed ? "Asosiy saytga o‘tish" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              darkMode
                ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <RiGlobalLine className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Asosiy saytga o‘tish</span>}
          </Link>
        </div>
      </aside>

      {/* Right Column: Top Header + Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header
          className={cn(
            "sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6",
            darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200/80"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Desktop collapse button */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className={cn(
                "hidden lg:inline-flex rounded-lg p-2 transition-colors cursor-pointer",
                darkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
              )}
              aria-label="Toggle sidebar"
            >
              <RiMenuLine className="h-5 w-5" />
            </button>
            {/* Mobile drawer button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className={cn(
                "lg:hidden inline-flex rounded-lg p-2 transition-colors cursor-pointer",
                darkMode
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
              )}
              aria-label="Open menu"
            >
              <RiMenuLine className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <ActiveIcon className="h-5 w-5 text-[#00C896] hidden sm:block" />
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                {activeTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />

            {/* Dark/Light Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer",
                darkMode
                  ? "text-amber-400 hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
              )}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <RiSunLine className="h-5 w-5" />
              ) : (
                <RiMoonLine className="h-5 w-5" />
              )}
            </button>

            {/* Admin Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-3 transition-colors cursor-pointer",
                  darkMode
                    ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  {initials}
                </span>
                <span className="hidden sm:inline text-sm font-medium">
                  {adminUser?.firstName || "admin"}
                </span>
                <RiArrowDownSLine className="h-4 w-4 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div
                  className={cn(
                    "absolute right-0 mt-2 w-52 rounded-xl border p-1.5 shadow-lg z-50",
                    darkMode
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-slate-200"
                  )}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold">
                      {adminUser?.firstName} {adminUser?.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400">{adminUser?.phone}</p>
                  </div>
                  <Link
                    href="/"
                    onClick={() => setProfileMenuOpen(false)}
                    className={cn(
                      "mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                      darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
                    )}
                  >
                    <RiGlobalLine className="h-4 w-4" />
                    Asosiy sayt
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <RiLogoutBoxRLine className="h-4 w-4" />
                    {t.common.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 w-full">
          {section === "overview" && (
            <>
              {loadingStats || !stats ? (
                <div className="flex items-center justify-center py-24 text-slate-500">
                  <RiLoader4Line className="h-6 w-6 animate-spin mr-2" />
                  {t.common.loading}
                </div>
              ) : (
                <AdminStatsOverview stats={stats} darkMode={darkMode} />
              )}
            </>
          )}
          {section === "orders" && <AdminOrdersManager onChanged={loadStats} />}
          {section === "services" && <AdminServicesManager />}
          {section === "users" && <AdminUsersTable darkMode={darkMode} />}
          {section === "broadcast" && <AdminBroadcastPanel />}
          {section === "audit" && <AdminAuditLogTable />}
          {section === "telegram" && <AdminTelegramPanel />}
          {section === "settings" && <AdminSettingsPanel />}
        </main>
      </div>
    </div>
  );
}
