"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RiBookOpenLine as BookOpenCheck, RiUserAddLine as UserPlus } from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatUzPhoneInput, localeToLanguageEnum } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function RegisterForm() {
  const { locale, t } = useI18n();
  const { refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          password,
          language: localeToLanguageEnum(locale),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Ro‘yxatdan o‘tishda xatolik");
        return;
      }

      await refreshUser();
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch {
      setError("Server bilan aloqa uzildi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:py-20">
      <Card className="p-7 sm:p-8 shadow-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F4E79] text-white">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {t.auth.registerTitle}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">{t.auth.registerSubtitle}</p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
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
              {t.auth.password}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi"
              className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
            />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            <UserPlus className="h-4 w-4" />
            {t.auth.registerButton}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-[#1F4E79] hover:underline">
            {t.common.login}
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
