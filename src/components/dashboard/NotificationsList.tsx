"use client";

import React from "react";
import {
  RiNotification3Line as Bell,
  RiCheckDoubleLine as CheckCheck,
  RiMegaphoneLine as Megaphone,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import type { NotificationDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function NotificationsList({
  notifications,
  onMarkAllRead,
}: {
  notifications: NotificationDTO[];
  onMarkAllRead: () => Promise<void>;
}) {
  const { t } = useI18n();
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            {t.dashboard.markAllRead}
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="p-10 text-center text-slate-500">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm">{t.dashboard.notificationsEmpty}</p>
        </Card>
      ) : (
        notifications.map((n) => (
          <Card
            key={n.id}
            className={cn(
              "p-4 flex items-start gap-3.5",
              !n.isRead && "border-[#1F4E79]/30 bg-[#EDF4FA]/40"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                n.type === "BROADCAST"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-[#EDF4FA] text-[#1F4E79]"
              )}
            >
              {n.type === "BROADCAST" ? (
                <Megaphone className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{n.title}</h4>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{n.message}</p>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
