"use client";

import React from "react";
import {
  RiFileList3Line,
  RiWallet3Line,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { formatUZS } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

interface DashboardStatsCardsProps {
  totalOrders: number;
  totalSpent: number;
  completedOrders: number;
}

export function DashboardStatsCards({
  totalOrders,
  totalSpent,
  completedOrders,
}: DashboardStatsCardsProps) {
  const { locale, t } = useI18n();

  const items = [
    {
      label: t.dashboard.totalOrders,
      value: String(totalOrders),
      icon: RiFileList3Line,
      valueColor: "text-blue-600",
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: t.dashboard.totalSpent,
      value: formatUZS(totalSpent, locale),
      icon: RiWallet3Line,
      valueColor: "text-purple-600",
      accent: "bg-purple-50 text-purple-600",
    },
    {
      label: t.dashboard.completedOrders,
      value: String(completedOrders),
      icon: RiCheckboxCircleLine,
      valueColor: "text-emerald-600",
      accent: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className={`mt-1 text-2xl font-bold truncate ${item.valueColor}`}>
                {item.value}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.accent}`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
