"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  RiTeamLine,
  RiTranslate2,
  RiFileList3Line,
  RiCheckboxCircleLine,
  RiWallet3Line,
  RiPieChart2Line,
  RiBarChartGroupedLine,
} from "react-icons/ri";
import type { OrderStatus } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { getServiceLocalizedName } from "@/lib/i18n/dictionaries";
import { formatUZS } from "@/lib/utils";

export interface AdminStatsData {
  totalUsers: number;
  telegramLinkedUsers: number;
  activeServicesCount: number;
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  newOrdersCount?: number;
  statusCounts: Record<OrderStatus, number>;
  serviceBreakdown: Array<{
    id: string;
    nameUz: string;
    nameRu: string;
    nameEn: string;
    ordersCount: number;
    price: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalPrice: number;
    status: OrderStatus;
    createdAt: string;
    service: { nameUz: string; nameRu: string; nameEn: string };
    user: { firstName: string; lastName: string; phone: string | null };
  }>;
}

const PIE_COLORS: Record<OrderStatus, string> = {
  COMPLETED: "#00C896",
  IN_PROGRESS: "#22C55E",
  PAID: "#3B82F6",
  WAITING_PAYMENT: "#F59E0B",
  PENDING: "#F97316",
  CANCELLED: "#EF4444",
  REFUNDED: "#8B5CF6",
};

const LEGEND_ORDER: OrderStatus[] = [
  "CANCELLED",
  "WAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
];

export function AdminStatsOverview({
  stats,
  darkMode = false,
}: {
  stats: AdminStatsData;
  darkMode?: boolean;
}) {
  const { locale, t } = useI18n();

  const cardSurface = darkMode
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200/80 text-slate-900";

  // 5 KPI cards matching screenshot layout + tailored icons on the right
  const kpis = [
    {
      label: t.admin.totalUsers,
      value: String(stats.totalUsers),
      color: "text-blue-600",
      icon: RiTeamLine,
      iconBox: darkMode
        ? "bg-blue-500/15 text-blue-400"
        : "bg-blue-50 text-blue-600",
    },
    {
      label: t.admin.navServices,
      value: String(stats.activeServicesCount),
      color: "text-emerald-600",
      icon: RiTranslate2,
      iconBox: darkMode
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-emerald-50 text-emerald-600",
    },
    {
      label: t.admin.totalOrders,
      value: String(stats.totalOrders),
      color: "text-purple-600",
      icon: RiFileList3Line,
      iconBox: darkMode
        ? "bg-purple-500/15 text-purple-400"
        : "bg-purple-50 text-purple-600",
    },
    {
      label: t.admin.completedOrders,
      value: String(stats.completedOrders),
      color: "text-orange-500",
      icon: RiCheckboxCircleLine,
      iconBox: darkMode
        ? "bg-orange-500/15 text-orange-400"
        : "bg-orange-50 text-orange-500",
    },
    {
      label: t.admin.totalRevenue,
      value: formatUZS(stats.totalRevenue, locale),
      color: "text-pink-600",
      icon: RiWallet3Line,
      iconBox: darkMode
        ? "bg-pink-500/15 text-pink-400"
        : "bg-pink-50 text-pink-600",
    },
  ];

  // PieChart data
  const totalForPie = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0);
  const pieData = (Object.keys(stats.statusCounts) as OrderStatus[])
    .filter((status) => stats.statusCounts[status] > 0)
    .map((status) => ({
      status,
      name: t.statuses[status],
      value: stats.statusCounts[status],
      pct:
        totalForPie > 0
          ? Math.round((stats.statusCounts[status] / totalForPie) * 100)
          : 0,
      color: PIE_COLORS[status],
    }));

  // BarChart data
  const barData = stats.serviceBreakdown.map((svc) => ({
    name: getServiceLocalizedName(svc, locale),
    shortName:
      getServiceLocalizedName(svc, locale).length > 18
        ? getServiceLocalizedName(svc, locale).slice(0, 17) + "…"
        : getServiceLocalizedName(svc, locale),
    orders: svc.ordersCount,
    price: svc.price,
  }));

  return (
    <div className="space-y-6">
      {/* 5 KPI Cards Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`rounded-xl border px-5 py-4 shadow-2xs transition-colors flex items-start justify-between gap-3 ${cardSurface}`}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">
                  {kpi.label}
                </p>
                <p
                  className={`mt-2 text-xl xl:text-2xl font-bold tracking-tight truncate ${kpi.color}`}
                >
                  {kpi.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.iconBox}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Charts Grid (PieChart Left + BarChart Right) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Chart: Buyurtmalar Holati Taqsimoti */}
        <div className={`rounded-xl border p-6 shadow-2xs ${cardSurface}`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C896]/15 text-[#00C896]">
              <RiPieChart2Line className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold">{t.admin.statusDistribution}</h3>
          </div>

          {pieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              Buyurtmalar paydo bo‘lganda grafik avtomatik chiziladi
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={88}
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={({ name, payload }) =>
                      `${name}: ${(payload as { pct?: number })?.pct ?? 0}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #E2E8F0",
                      backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
                      color: darkMode ? "#F8FAFC" : "#0F172A",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bottom Horizontal Legend */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            {LEGEND_ORDER.map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-3 rounded-[2px]"
                  style={{ backgroundColor: PIE_COLORS[status] }}
                />
                <span style={{ color: PIE_COLORS[status] }} className="font-medium">
                  {t.statuses[status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart: Xizmatlar Bo'yicha Buyurtmalar */}
        <div className={`rounded-xl border p-6 shadow-2xs ${cardSurface}`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C896]/15 text-[#00C896]">
              <RiBarChartGroupedLine className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold">Xizmatlar Bo‘yicha Buyurtmalar</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 12, right: 16, left: -12, bottom: 48 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={darkMode ? "#1E293B" : "#E2E8F0"}
                />
                <XAxis
                  dataKey="shortName"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{
                    fontSize: 11,
                    fill: darkMode ? "#94A3B8" : "#475569",
                  }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 11,
                    fill: darkMode ? "#94A3B8" : "#475569",
                  }}
                />
                <Tooltip
                  cursor={{
                    fill: darkMode
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,200,150,0.08)",
                  }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",
                    color: darkMode ? "#F8FAFC" : "#0F172A",
                    fontSize: "12px",
                  }}
                  formatter={(value: unknown) => [`${value} ta buyurtma`, "Soni"]}
                />
                <Bar
                  dataKey="orders"
                  fill="#00C896"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={72}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
