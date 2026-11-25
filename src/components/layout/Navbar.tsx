"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiArrowDownSLine,
  RiCheckDoubleLine,
  RiCloseLine as X,
  RiDashboardLine,
  RiGlobalLine,
  RiLogoutBoxRLine,
  RiMenuLine as Menu,
  RiNotification3Line,
} from "react-icons/ri";
import logoImg from "@/assets/logo.jpg";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/components/providers/AuthProvider";
import type { NotificationDTO } from "@/types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { cn, formatUzPhone } from "@/lib/utils";

export function Navbar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [markingRead, setMarkingRead] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { notifications?: NotificationDTO[] };
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // Ignore transient network errors
    }
  }, [user]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications, pathname]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 20000);
    const onUpdated = () => void fetchNotifications();
    window.addEventListener("lb:notifications-updated", onUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener("lb:notifications-updated", onUpdated);
    };
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!profileMenuOpen && !notifMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setNotifMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileMenuOpen(false);
        setNotifMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen, notifMenuOpen]);

  async function handleMarkAllRead() {
    setMarkingRead(true);
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        window.dispatchEvent(new Event("lb:notifications-updated"));
      }
    } finally {
      setMarkingRead(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { href: "/#services", label: t.common.services },
    { href: "/#calculator", label: t.common.calculator },
    { href: "/#how-it-works", label: t.common.howItWorks },
    { href: "/#faq", label: t.common.faq },
  ];

  const initials = user
    ? `${user.firstName?.[0] || "F"}${user.lastName?.[0] || user.firstName?.[1] || ""}`.toUpperCase()
    : "U";

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim() || "Foydalanuvchi"
    : "";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[84px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-full bg-white shadow-xs ring-1 ring-slate-200/70 transition-transform group-hover:scale-105">
            <Image
              src={logoImg}
              alt={t.common.brand}
              fill
              sizes="70px"
              priority
              className="object-cover"
            />
          </div>
          <div className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-slate-900">
              {t.common.brand}
            </span>
            <span className="hidden sm:block text-[11px] font-medium text-slate-500">
              {t.common.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-[#1F4E79] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link href="/order">
                <Button size="sm">{t.common.orderNow}</Button>
              </Link>

              {/* Notifications Bell with Red Unread Count Badge */}
              <div ref={notifMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifMenuOpen((v) => !v);
                    setProfileMenuOpen(false);
                  }}
                  title={t.dashboard.tabNotifications}
                  aria-label={t.dashboard.tabNotifications}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1F4E79] cursor-pointer"
                >
                  <RiNotification3Line className="h-[19px] w-[19px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white shadow-xs ring-2 ring-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-xs font-bold text-slate-900">
                        {t.dashboard.tabNotifications}
                        {unreadCount > 0 && (
                          <span className="ml-1.5 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                            {unreadCount}
                          </span>
                        )}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          disabled={markingRead}
                          onClick={handleMarkAllRead}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F4E79] hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          <RiCheckDoubleLine className="h-3.5 w-3.5" />
                          {t.dashboard.markAllRead}
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-xs text-slate-400">
                          {t.dashboard.notificationsEmpty}
                        </p>
                      ) : (
                        notifications.slice(0, 8).map((item) => (
                          <Link
                            key={item.id}
                            href="/dashboard?tab=notifications"
                            onClick={() => setNotifMenuOpen(false)}
                            className={cn(
                              "block px-4 py-3 transition-colors hover:bg-slate-50",
                              !item.isRead && "bg-sky-50/55"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {!item.isRead && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 leading-snug">
                                  {item.title}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-center">
                      <Link
                        href="/dashboard?tab=notifications"
                        onClick={() => setNotifMenuOpen(false)}
                        className="text-xs font-semibold text-[#1F4E79] hover:underline"
                      >
                        {t.common.all} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill Dropdown */}
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen((v) => !v);
                    setNotifMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-3 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F4E79] text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="text-sm font-medium text-slate-800 max-w-[140px] truncate">
                    {user.firstName || "Foydalanuvchi"}
                  </span>
                  <RiArrowDownSLine
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200",
                      profileMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {formatUzPhone(user.phone)}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <RiDashboardLine className="h-4 w-4 text-slate-500" />
                      {t.common.dashboard}
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <RiGlobalLine className="h-4 w-4 text-slate-500" />
                      {t.common.home}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <RiLogoutBoxRLine className="h-4 w-4" />
                      {t.common.logout}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t.common.login}
                </Button>
              </Link>
              <Link href="/order">
                <Button size="sm">{t.common.orderNow}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <Link
              href="/dashboard?tab=notifications"
              title={t.dashboard.tabNotifications}
              aria-label={t.dashboard.tabNotifications}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
            >
              <RiNotification3Line className="h-[19px] w-[19px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F4E79] text-xs font-bold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {formatUzPhone(user.phone)}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <RiDashboardLine className="h-4 w-4" />
                    {t.common.dashboard}
                  </Button>
                </Link>
                <Link href="/order" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">{t.common.orderNow}</Button>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <RiLogoutBoxRLine className="h-4 w-4" />
                  {t.common.logout}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.common.login}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    {t.common.register}
                  </Button>
                </Link>
                <Link href="/order" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">{t.common.orderNow}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
