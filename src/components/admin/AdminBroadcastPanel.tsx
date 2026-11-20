"use client";

import React, { useState } from "react";
import { RiCheckboxCircleLine as CheckCircle2, RiMegaphoneLine as Megaphone, RiSendPlaneLine as Send } from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AdminBroadcastPanel() {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendToTelegram, setSendToTelegram] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    inAppRecipients: number;
    telegram: { sent: number; failed: number };
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, sendToTelegram }),
      });
      const data = (await res.json()) as {
        inAppRecipients?: number;
        telegram?: { sent: number; failed: number };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Xabarnoma yuborishda xatolik");
        return;
      }
      setResult({
        inAppRecipients: data.inAppRecipients ?? 0,
        telegram: data.telegram ?? { sent: 0, failed: 0 },
      });
      setTitle("");
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF4FA] text-[#1F4E79] dark:bg-[#00C896]/15 dark:text-[#00C896]">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.admin.broadcastTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.admin.broadcastSubtitle}</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div>
            <p className="font-semibold">Xabarnoma muvaffaqiyatli yuborildi!</p>
            <p className="text-xs mt-1">
              Veb-kabinet: <strong>{result.inAppRecipients}</strong> ta foydalanuvchi •
              Telegram Bot: <strong>{result.telegram.sent}</strong> yuborildi (
              {result.telegram.failed} xato)
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.admin.broadcastSubject}
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Yangi akademik chegirma yoki ish jadvali"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 focus:border-[#00C896] focus:outline-none focus:ring-2 focus:ring-[#00C896]/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.admin.broadcastMessage}
          </label>
          <textarea
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Foydalanuvchilar uchun e’lon matnini kiriting..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 focus:border-[#00C896] focus:outline-none focus:ring-2 focus:ring-[#00C896]/20"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={sendToTelegram}
            onChange={(e) => setSendToTelegram(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          {t.admin.broadcastTelegram}
        </label>

        <div>
          <Button type="submit" loading={sending} className="bg-[#00C896] hover:bg-[#00B085]">
            <Send className="h-4 w-4" />
            {t.admin.sendBroadcastBtn}
          </Button>
        </div>
      </form>
    </Card>
  );
}
