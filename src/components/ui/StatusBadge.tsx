"use client";

import React from "react";
import type { OrderStatus } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  WAITING_PAYMENT: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  PAID: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  IN_PROGRESS: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  CANCELLED: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
  REFUNDED: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
};

const DOT_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-slate-400",
  WAITING_PAYMENT: "bg-amber-500",
  PAID: "bg-sky-500",
  IN_PROGRESS: "bg-indigo-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-rose-500",
  REFUNDED: "bg-purple-500",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[status])} />
      {t.statuses[status]}
    </span>
  );
}
