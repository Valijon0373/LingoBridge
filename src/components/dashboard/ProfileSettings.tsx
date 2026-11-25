"use client";

import React, { useEffect, useState } from "react";
import {
  RiRobot2Line as Bot,
  RiCheckboxCircleLine as CheckCircle2,
  RiCheckLine as Check,
  RiExternalLinkLine as ExternalLink,
  RiSendPlaneLine as Send,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { formatUzPhone, formatUzPhoneInput, languageEnumToLocale } from "@/lib/utils";
import type { UserDTO } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ProfileSettingsProps {
  user: UserDTO;
  onUpdated: (user: UserDTO) => void;
}

export function ProfileSettings({ user, onUpdated }: ProfileSettingsProps) {
  const { t, setLocale } = useI18n();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(formatUzPhone(user.phone));
  const [language, setLanguage] = useState<"UZ" | "RU" | "EN">(user.language);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [linkingTelegram, setLinkingTelegram] = useState(false);
  const [telegramDeepLink, setTelegramDeepLink] = useState<string | null>(null);

  useEffect(() => {
    if (!savedMsg) return;
    const timer = setTimeout(() => {
      setSavedMsg(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [savedMsg]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, language }),
      });
      const data = (await res.json()) as { user?: UserDTO; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || "Saqlashda xatolik yuz berdi");
        return;
      }
      onUpdated(data.user);
      setLocale(languageEnumToLocale(data.user.language));
      setSavedMsg(t.dashboard.profileSaved);
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateTelegramLink() {
    setLinkingTelegram(true);
    try {
      const res = await fetch("/api/profile/telegram-link", { method: "POST" });
      const data = (await res.json()) as { deepLink?: string };
      if (res.ok && data.deepLink) {
        setTelegramDeepLink(data.deepLink);
      }
    } finally {
      setLinkingTelegram(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="p-6 lg:col-span-7">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          {t.dashboard.profileTitle}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.auth.firstName}
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.auth.lastName}
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.auth.phone}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(formatUzPhoneInput(e.target.value))}
                placeholder="+998 90 123 45 67"
                className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm font-mono focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.auth.language}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "UZ" | "RU" | "EN")}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
              >
                <option value="UZ">🇺🇿 O‘zbek tili</option>
                <option value="RU">🇷🇺 Русский язык</option>
                <option value="EN">🇬🇧 English</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={saving}>
              <Check className="h-4 w-4" />
              {t.common.save}
            </Button>
          </div>
        </form>
      </Card>

      {/* Telegram Bot Linking Panel */}
      <Card className="p-6 lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-sky-50/70 to-white border-sky-200/70">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {t.dashboard.telegramSectionTitle}
              </h3>
              {user.telegramChatId && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t.dashboard.telegramConnected}
                  {user.telegramUsername ? ` (@${user.telegramUsername})` : ""}
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            {t.dashboard.telegramSectionDesc}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {telegramDeepLink ? (
            <div className="space-y-2.5">
              <a
                href={telegramDeepLink}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button className="w-full bg-sky-600 hover:bg-sky-700">
                  <Send className="h-4 w-4" />
                  {t.dashboard.telegramOpenBot}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
              <p className="text-[11px] text-slate-500 break-all bg-white border border-slate-200 rounded-lg p-2.5">
                {telegramDeepLink}
              </p>
            </div>
          ) : (
            <Button
              type="button"
              variant={user.telegramChatId ? "outline" : "primary"}
              className="w-full"
              loading={linkingTelegram}
              onClick={handleGenerateTelegramLink}
            >
              <Send className="h-4 w-4" />
              {t.dashboard.telegramConnectBtn}
            </Button>
          )}
        </div>
      </Card>

      <Modal
        open={Boolean(savedMsg)}
        onClose={() => setSavedMsg(null)}
        maxWidthClass="max-w-sm"
        title={t.dashboard.profileTitle}
      >
        <div className="flex flex-col items-center text-center py-2 space-y-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-base font-semibold text-slate-900">
            {savedMsg}
          </p>
        </div>
      </Modal>
    </div>
  );
}
