"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  RiDashboard3Line,
  RiNotification3Line as Bell,
  RiFileList3Line as FileText,
  RiLoader4Line as Loader2,
  RiAddLine as Plus,
  RiUserSettingsLine as UserIcon,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/components/providers/AuthProvider";
import type { NotificationDTO, OrderDTO, UserDTO } from "@/types";
import { Button } from "@/components/ui/Button";
import { DashboardStatsCards } from "./DashboardStatsCards";
import { OrdersList } from "./OrdersList";
import { ProfileSettings } from "./ProfileSettings";
import { NotificationsList } from "./NotificationsList";
import { cn } from "@/lib/utils";

type TabKey = "orders" | "profile" | "notifications";

export function ClientDashboardShell() {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [loading, setLoading] = useState(true);

  const [profileUser, setProfileUser] = useState<UserDTO | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
  });
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, ordersRes, notifRes] = await Promise.all([
        fetch("/api/profile", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);

      if (profileRes.ok) {
        const pData = (await profileRes.json()) as {
          user: UserDTO;
          stats: { totalOrders: number; totalSpent: number; completedOrders: number };
        };
        setProfileUser(pData.user);
        setStats(pData.stats);
      }
      if (ordersRes.ok) {
        const oData = (await ordersRes.json()) as { orders: OrderDTO[] };
        setOrders(oData.orders);
      }
      if (notifRes.ok) {
        const nData = (await notifRes.json()) as { notifications: NotificationDTO[] };
        setNotifications(nData.notifications);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "orders" || tab === "profile" || tab === "notifications") {
      setActiveTab(tab);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event("lb:notifications-updated"));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1F4E79] text-white shadow-xs">
            <RiDashboard3Line className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.title}</h1>
            <p className="text-sm text-slate-600 mt-0.5">{t.dashboard.subtitle}</p>
          </div>
        </div>
        <Link href="/order">
          <Button>
            <Plus className="h-4 w-4" />
            {t.dashboard.newOrderBtn}
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <DashboardStatsCards
        totalOrders={stats.totalOrders}
        totalSpent={stats.totalSpent}
        completedOrders={stats.completedOrders}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={cn(
            "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            activeTab === "orders"
              ? "border-[#1F4E79] text-[#1F4E79]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <FileText className="h-4 w-4" />
          {t.dashboard.tabOrders} ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={cn(
            "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            activeTab === "profile"
              ? "border-[#1F4E79] text-[#1F4E79]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <UserIcon className="h-4 w-4" />
          {t.dashboard.tabProfile}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={cn(
            "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            activeTab === "notifications"
              ? "border-[#1F4E79] text-[#1F4E79]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Bell className="h-4 w-4" />
          {t.dashboard.tabNotifications}
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && <OrdersList orders={orders} />}

      {activeTab === "profile" && profileUser && (
        <ProfileSettings
          user={profileUser}
          onUpdated={(u) => {
            setProfileUser(u);
            refreshUser();
          }}
        />
      )}

      {activeTab === "notifications" && (
        <NotificationsList
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
}
