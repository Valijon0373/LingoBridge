"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiBookOpenLine as BookOpenCheck,
  RiMenuLine as Menu,
  RiCloseLine as X,
  RiShieldCheckLine as ShieldCheck,
  RiDashboardLine as LayoutDashboard,
  RiLogoutBoxRLine as LogOut,
} from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/components/providers/AuthProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/#services", label: t.common.services },
    { href: "/#calculator", label: t.common.calculator },
    { href: "/#how-it-works", label: t.common.howItWorks },
    { href: "/#faq", label: t.common.faq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4E79] text-white shadow-xs group-hover:bg-[#163A5B] transition-colors">
            <BookOpenCheck className="h-5 w-5" />
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
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button
                    variant={pathname.startsWith("/admin") ? "primary" : "outline"}
                    size="sm"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t.common.adminPanel}
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button
                  variant={pathname.startsWith("/dashboard") ? "primary" : "outline"}
                  size="sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t.common.dashboard}
                </Button>
              </Link>
              <Link href="/order">
                <Button size="sm">{t.common.orderNow}</Button>
              </Link>
              <button
                type="button"
                onClick={logout}
                title={t.common.logout}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
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
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">
                      <ShieldCheck className="h-4 w-4" />
                      {t.common.adminPanel}
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard className="h-4 w-4" />
                    {t.common.dashboard} ({user.firstName})
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
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  )}
                >
                  <LogOut className="h-4 w-4" />
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
