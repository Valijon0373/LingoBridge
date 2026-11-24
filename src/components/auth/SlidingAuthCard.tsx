"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiBookOpenLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLockPasswordLine,
  RiLoginBoxLine,
  RiPhoneLine,
  RiUserAddLine,
  RiUserLine,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn, formatUzPhoneInput, localeToLanguageEnum } from "@/lib/utils";

type AuthMode = "login" | "register";

interface SlidingAuthCardProps {
  initialMode: AuthMode;
}

export function SlidingAuthCard({ initialMode }: SlidingAuthCardProps) {
  const { locale, t } = useI18n();
  const { refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isSignUp = mode === "register";

  // Sync if user navigates via Navbar links between /login and /register
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Login state
  const [loginPhone, setLoginPhone] = useState("+998 ");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("+998 ");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setLoginError(null);
    setRegisterError(null);

    // Keep browser URL in sync without unmounting the component so the slide animation stays smooth
    if (typeof window !== "undefined") {
      const nextParam = searchParams.get("next");
      const query = nextParam ? `?next=${encodeURIComponent(nextParam)}` : "";
      const targetPath = nextMode === "register" ? `/register${query}` : `/login${query}`;
      window.history.replaceState(null, "", targetPath);
    }
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });

      const data = (await res.json()) as {
        user?: { role: string };
        error?: string;
      };

      if (!res.ok) {
        setLoginError(data.error || "Kirishda xatolik");
        return;
      }

      await refreshUser();
      const next = searchParams.get("next");
      if (next && next.startsWith("/")) {
        router.push(next);
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setLoginError("Server bilan aloqa uzildi");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegisterError(null);
    setRegisterLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: registerPhone,
          password: registerPassword,
          language: localeToLanguageEnum(locale),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setRegisterError(data.error || "Ro‘yxatdan o‘tishda xatolik");
        return;
      }

      await refreshUser();
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch {
      setRegisterError("Server bilan aloqa uzildi");
    } finally {
      setRegisterLoading(false);
    }
  }

  const inputBaseClass =
    "h-11 w-full rounded-xl border border-transparent bg-[#EEF2F7] text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#1F4E79]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/15";

  const renderLoginForm = (isHidden: boolean) => (
    <form
      onSubmit={handleLoginSubmit}
      className="flex w-full max-w-[330px] flex-col items-center"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF4FA] text-[#1F4E79] shadow-xs">
        <RiBookOpenLine className="h-5 w-5" />
      </div>

      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
        {t.auth.loginTitle}
      </h1>
      <p className="mt-1.5 text-xs font-medium text-slate-500 text-center">
        {t.auth.loginHint}
      </p>

      {loginError && (
        <div className="mt-4 w-full rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-left text-xs font-medium text-rose-700">
          {loginError}
        </div>
      )}

      <div className="mt-5 w-full space-y-3">
        <div className="relative">
          <RiPhoneLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            required
            tabIndex={isHidden ? -1 : undefined}
            value={loginPhone}
            onChange={(e) => setLoginPhone(formatUzPhoneInput(e.target.value))}
            placeholder="+998 90 123 45 67"
            aria-label={t.auth.phone}
            className={cn(inputBaseClass, "pl-10 pr-3.5 font-mono")}
          />
        </div>

        <div className="relative">
          <RiLockPasswordLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showLoginPassword ? "text" : "password"}
            required
            tabIndex={isHidden ? -1 : undefined}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder={t.auth.password}
            aria-label={t.auth.password}
            className={cn(inputBaseClass, "pl-10 pr-10")}
          />
          <button
            type="button"
            tabIndex={isHidden ? -1 : undefined}
            onClick={() => setShowLoginPassword((v) => !v)}
            aria-label={showLoginPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showLoginPassword ? (
              <RiEyeOffLine className="h-4 w-4" />
            ) : (
              <RiEyeLine className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loginLoading}
        tabIndex={isHidden ? -1 : undefined}
        className="mt-6 inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1F4E79] to-[#2E6DA4] px-8 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#1F4E79]/25 transition-all hover:from-[#163A5B] hover:to-[#1F4E79] hover:shadow-lg hover:shadow-[#1F4E79]/30 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {loginLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <RiLoginBoxLine className="h-4 w-4" />
        )}
        <span>{t.auth.loginButton}</span>
      </button>
    </form>
  );

  const renderRegisterForm = (isHidden: boolean) => (
    <form
      onSubmit={handleRegisterSubmit}
      className="flex w-full max-w-[330px] flex-col items-center"
    >
      <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF4FA] text-[#1F4E79] shadow-xs">
        <RiUserAddLine className="h-5 w-5" />
      </div>

      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
        {t.auth.registerTitle}
      </h1>
      <p className="mt-1 text-xs font-medium text-slate-500 text-center">
        {t.auth.registerHint}
      </p>

      {registerError && (
        <div className="mt-3.5 w-full rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-left text-xs font-medium text-rose-700">
          {registerError}
        </div>
      )}

      <div className="mt-4 w-full space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <RiUserLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              tabIndex={isHidden ? -1 : undefined}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t.auth.firstName}
              aria-label={t.auth.firstName}
              className={cn(inputBaseClass, "pl-9 pr-3")}
            />
          </div>

          <div className="relative">
            <RiUserLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              tabIndex={isHidden ? -1 : undefined}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t.auth.lastName}
              aria-label={t.auth.lastName}
              className={cn(inputBaseClass, "pl-9 pr-3")}
            />
          </div>
        </div>

        <div className="relative">
          <RiPhoneLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            required
            tabIndex={isHidden ? -1 : undefined}
            value={registerPhone}
            onChange={(e) => setRegisterPhone(formatUzPhoneInput(e.target.value))}
            placeholder="+998 90 123 45 67"
            aria-label={t.auth.phone}
            className={cn(inputBaseClass, "pl-10 pr-3.5 font-mono")}
          />
        </div>

        <div className="relative">
          <RiLockPasswordLine className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showRegisterPassword ? "text" : "password"}
            required
            minLength={6}
            tabIndex={isHidden ? -1 : undefined}
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder={t.auth.passwordHint}
            aria-label={t.auth.password}
            className={cn(inputBaseClass, "pl-10 pr-10")}
          />
          <button
            type="button"
            tabIndex={isHidden ? -1 : undefined}
            onClick={() => setShowRegisterPassword((v) => !v)}
            aria-label={showRegisterPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showRegisterPassword ? (
              <RiEyeOffLine className="h-4 w-4" />
            ) : (
              <RiEyeLine className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={registerLoading}
        tabIndex={isHidden ? -1 : undefined}
        className="mt-5 inline-flex h-11 min-w-[185px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1F4E79] to-[#2E6DA4] px-8 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#1F4E79]/25 transition-all hover:from-[#163A5B] hover:to-[#1F4E79] hover:shadow-lg hover:shadow-[#1F4E79]/30 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {registerLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <RiUserAddLine className="h-4 w-4" />
        )}
        <span>{t.auth.registerButton}</span>
      </button>
    </form>
  );

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#DCE7F7] via-[#EDF2FB] to-[#D6E4F8] px-4 py-10 sm:py-16">
      {/* Subtle decorative ambient circles */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#2E6DA4]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#1F4E79]/15 blur-3xl" />

      {/* Desktop Sliding Split Card (md and up) */}
      <div className="relative hidden md:block w-full max-w-[850px] min-h-[530px] overflow-hidden rounded-[30px] bg-white shadow-[0_20px_50px_rgba(22,58,91,0.18)] ring-1 ring-white/80">
        {/* Sign In Form Container */}
        <div
          aria-hidden={isSignUp}
          className={cn(
            "absolute top-0 left-0 flex h-full w-1/2 items-center justify-center px-9 transition-all duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
            isSignUp
              ? "translate-x-full opacity-0 z-10 pointer-events-none"
              : "translate-x-0 opacity-100 z-20 pointer-events-auto"
          )}
        >
          {renderLoginForm(isSignUp)}
        </div>

        {/* Sign Up Form Container */}
        <div
          aria-hidden={!isSignUp}
          className={cn(
            "absolute top-0 left-0 flex h-full w-1/2 items-center justify-center px-9 transition-all duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
            isSignUp
              ? "translate-x-full opacity-100 z-20 pointer-events-auto"
              : "translate-x-0 opacity-0 z-10 pointer-events-none"
          )}
        >
          {renderRegisterForm(!isSignUp)}
        </div>

        {/* Sliding Curved Gradient Overlay */}
        <div
          style={{
            transform: isSignUp ? "translateX(-100%)" : "translateX(0%)",
            borderRadius: isSignUp ? "0 150px 100px 0" : "150px 0 0 100px",
          }}
          className="absolute top-0 left-1/2 z-30 h-full w-1/2 overflow-hidden shadow-2xl transition-[transform,border-radius] duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        >
          <div
            style={{
              transform: isSignUp ? "translateX(50%)" : "translateX(0%)",
            }}
            className="relative -left-full h-full w-[200%] bg-gradient-to-r from-[#2E6DA4] via-[#1F4E79] to-[#163A5B] text-white transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          >
            {/* Subtle glowing accents inside the curved panel */}
            <div className="pointer-events-none absolute -top-20 left-1/4 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[#00C896]/15 blur-3xl" />

            {/* Left Overlay Panel (shown when Register is active -> prompt to Sign In) */}
            <div
              className={cn(
                "absolute top-0 left-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-all duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
                isSignUp ? "translate-x-0 opacity-100" : "-translate-x-[20%] opacity-0"
              )}
            >
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/90 backdrop-blur-xs">
                <RiBookOpenLine className="h-3.5 w-3.5" />
                {t.common.brand}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                {t.auth.overlayLoginTitle}
              </h2>
              <p className="mt-3 max-w-[270px] text-sm leading-relaxed text-white/85">
                {t.auth.overlayLoginSubtitle}
              </p>
              <button
                type="button"
                tabIndex={isSignUp ? undefined : -1}
                onClick={() => switchMode("login")}
                className="mt-7 inline-flex h-11 min-w-[160px] items-center justify-center rounded-xl border border-white/90 bg-transparent px-8 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#1F4E79] active:scale-[0.98] cursor-pointer"
              >
                {t.auth.loginButton}
              </button>
            </div>

            {/* Right Overlay Panel (shown when Login is active -> prompt to Sign Up) */}
            <div
              className={cn(
                "absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-all duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
                isSignUp ? "translate-x-[20%] opacity-0" : "translate-x-0 opacity-100"
              )}
            >
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/90 backdrop-blur-xs">
                <RiBookOpenLine className="h-3.5 w-3.5" />
                {t.common.brand}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                {t.auth.overlayRegisterTitle}
              </h2>
              <p className="mt-3 max-w-[270px] text-sm leading-relaxed text-white/85">
                {t.auth.overlayRegisterSubtitle}
              </p>
              <button
                type="button"
                tabIndex={isSignUp ? -1 : undefined}
                onClick={() => switchMode("register")}
                className="mt-7 inline-flex h-11 min-w-[160px] items-center justify-center rounded-xl border border-white/90 bg-transparent px-8 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#1F4E79] active:scale-[0.98] cursor-pointer"
              >
                {t.auth.registerButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Card (< md) */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_18px_42px_rgba(22,58,91,0.16)] md:hidden">
        <div className="relative overflow-hidden rounded-b-[42px] bg-gradient-to-br from-[#2E6DA4] via-[#1F4E79] to-[#163A5B] px-6 pt-7 pb-7 text-center text-white">
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isSignUp ? t.auth.overlayLoginTitle : t.auth.overlayRegisterTitle}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-white/85">
            {isSignUp ? t.auth.registerSubtitle : t.auth.loginSubtitle}
          </p>

          {/* Segmented Pill Switcher */}
          <div className="mx-auto mt-5 grid max-w-[280px] grid-cols-2 rounded-xl bg-white/15 p-1 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer",
                !isSignUp
                  ? "bg-white text-[#1F4E79] shadow-xs"
                  : "text-white/90 hover:text-white"
              )}
            >
              {t.common.login}
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer",
                isSignUp
                  ? "bg-white text-[#1F4E79] shadow-xs"
                  : "text-white/90 hover:text-white"
              )}
            >
              {t.common.register}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center px-6 py-7">
          {isSignUp ? renderRegisterForm(false) : renderLoginForm(false)}
        </div>
      </div>
    </section>
  );
}
