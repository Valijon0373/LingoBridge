"use client";

import React, { useEffect, useState } from "react";
import { RiHistoryLine as History, RiLoader4Line as Loader2 } from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import type { AdminActionDTO } from "@/types";
import { Card } from "@/components/ui/Card";

export function AdminAuditLogTable() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<AdminActionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { logs: [] }))
      .then((data: { logs: AdminActionDTO[] }) => setLogs(data.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
        <History className="h-5 w-5 text-[#1F4E79] dark:text-[#00C896]" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.admin.auditTitle}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          {t.common.loading}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Sana</th>
                <th className="px-4 py-3 font-semibold">Admin</th>
                <th className="px-4 py-3 font-semibold">Obyekt</th>
                <th className="px-4 py-3 font-semibold">Harakat</th>
                <th className="px-4 py-3 font-semibold">Tafsilotlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {log.admin.firstName} {log.admin.lastName}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-slate-700 dark:text-slate-300">
                      {log.targetType}
                      {log.order ? ` #${log.order.orderNumber}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1F4E79] dark:text-[#00C896]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-md truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-400">
                    Hozircha audit yozuvlari mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
