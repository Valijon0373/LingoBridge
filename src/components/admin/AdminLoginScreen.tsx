"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiShieldKeyholeLine,
  RiPhoneLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowLeftLine,
  RiLoginBoxLine,
} from "react-icons/ri";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatUzPhoneInput } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function AdminLoginScreen({
  nonAdminNotice = false,
}: {
  nonAdminNotice?: boolean;
}) {
  const router = useRouter();
  const { refreshUser, logout } = useAuth();

  const [phone, setPhone] = useState("+998 90 000 00 00");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    nonAdminNotice
      ? "Joriy hisobingizda ADMIN huquqi yo‘q. Iltimos, administrator hisobi bilan kiring."
      : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = (await res.json()) as {
        user?: { role: string };
        error?: string;
      };

      if (!res.ok) {
        setError(data.error || "Telefon raqam yoki parol noto‘g‘ri");
        return;
      }

      if (data.user?.role !== "ADMIN") {
        setError("Ushbu hisob administrator emas. Faqat ADMIN roli kirishi mumkin.");
        return;
      }

      await refreshUser();
      router.refresh();
    } catch {
      setError("Server bilan aloqa uzildi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7FA] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00C896] text-white shadow-lg shadow-[#00C896]/25">
            <RiShieldKeyholeLine className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Lingo Bridge Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Boshqaruv paneliga kirish uchun administrator ma’lumotlarini kiriting
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Admin telefon raqami
              </label>
              <div className="relative">
                <RiPhoneLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatUzPhoneInput(e.target.value))}
                  placeholder="+998 90 000 00 00"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 text-sm font-mono text-slate-900 focus:border-[#00C896] focus:outline-none focus:ring-2 focus:ring-[#00C896]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <RiLockPasswordLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 focus:border-[#00C896] focus:outline-none focus:ring-2 focus:ring-[#00C896]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="h-4 w-4" />
                  ) : (
                    <RiEyeLine className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full h-11 rounded-xl bg-[#00C896] hover:bg-[#00B085] text-white font-semibold shadow-sm shadow-[#00C896]/25"
            >
              <RiLoginBoxLine className="h-4 w-4" />
              Admin panelga kirish
            </Button>
          </form>

          {nonAdminNotice && (
            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full text-center text-xs font-medium text-rose-600 hover:underline cursor-pointer"
            >
              Joriy hisobdan chiqish
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RiArrowLeftLine className="h-4 w-4" />
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
