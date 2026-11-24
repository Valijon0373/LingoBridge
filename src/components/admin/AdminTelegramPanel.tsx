"use client";

import React, { useEffect, useState } from "react";
import {
  RiRobot2Line as Bot,
  RiCheckboxCircleLine as CheckCircle2,
  RiGlobalLine as Globe,
  RiLoader4Line as Loader2,
  RiCloseCircleLine as XCircle,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface TelegramStatusDTO {
  configured: boolean;
  ok?: boolean;
  username: string;
  webhookUrl?: string;
  pendingUpdates?: number;
  adminChatCount: number;
  bot?: { id: number; username: string; first_name: string } | null;
}

export function AdminTelegramPanel() {
  const { t } = useI18n();
  const [info, setInfo] = useState<TelegramStatusDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/telegram", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { telegram?: TelegramStatusDTO } | null) => {
        if (data?.telegram) {
          setInfo(data.telegram);
          setWebhookUrl(data.telegram.webhookUrl || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSetWebhook(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok) {
        setMessage("Telegram webhook muvaffaqiyatli o‘rnatildi!");
      } else {
        setMessage(data.error || "Webhook o‘rnatishda xatolik");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.admin.telegramTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.admin.telegramSubtitle}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Bot holati</p>
            <div className="mt-1.5 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              {info?.configured && info?.ok ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Faol (@{info.username})</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-amber-500" />
                  <span>.env da token kiritilmagan</span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Admin Chat IDlar soni</p>
            <p className="mt-1.5 text-lg font-bold text-[#1F4E79] dark:text-[#00C896]">
              {info?.adminChatCount ?? 0} ta admin
            </p>
          </div>
        </div>

        <form onSubmit={handleSetWebhook} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Production Webhook URL (`POST /api/telegram/webhook`)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://lingobridge.uz/api/telegram/webhook"
              className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <Button type="submit" loading={saving} disabled={!info?.configured}>
              <Globe className="h-4 w-4" />
              Webhook o‘rnatish
            </Button>
          </div>
          {message && (
            <p className="text-xs font-medium text-[#1F4E79] dark:text-[#00C896]">{message}</p>
          )}
        </form>
      </Card>
    </div>
  );
}
