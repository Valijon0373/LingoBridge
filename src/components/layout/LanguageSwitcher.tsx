"use client";

import React, { useEffect, useRef, useState } from "react";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";

function FlagIcon({ code }: { code: Locale }) {
  if (code === "uz") {
    return (
      <svg
        viewBox="0 0 24 16"
        className="h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10"
        aria-hidden="true"
      >
        <rect width="24" height="5" y="0" fill="#1EB5E7" />
        <rect width="24" height="0.7" y="5" fill="#CE1126" />
        <rect width="24" height="4.6" y="5.7" fill="#FFFFFF" />
        <rect width="24" height="0.7" y="10.3" fill="#CE1126" />
        <rect width="24" height="5" y="11" fill="#1EB53A" />
        <circle cx="3.8" cy="2.5" r="1.4" fill="#FFFFFF" />
        <circle cx="4.3" cy="2.5" r="1.15" fill="#1EB5E7" />
        <circle cx="6.5" cy="1.8" r="0.35" fill="#FFFFFF" />
        <circle cx="7.7" cy="1.8" r="0.35" fill="#FFFFFF" />
        <circle cx="8.9" cy="1.8" r="0.35" fill="#FFFFFF" />
        <circle cx="6.5" cy="3.1" r="0.35" fill="#FFFFFF" />
        <circle cx="7.7" cy="3.1" r="0.35" fill="#FFFFFF" />
        <circle cx="8.9" cy="3.1" r="0.35" fill="#FFFFFF" />
      </svg>
    );
  }

  if (code === "en") {
    return (
      <svg
        viewBox="0 0 24 16"
        className="h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10"
        aria-hidden="true"
      >
        <rect width="24" height="16" fill="#012169" />
        <path d="M0 0 L24 16 M24 0 L0 16" stroke="#FFFFFF" strokeWidth="3.2" />
        <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
        <path d="M12 0 V16 M0 8 H24" stroke="#FFFFFF" strokeWidth="4.8" />
        <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 16"
      className="h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10"
      aria-hidden="true"
    >
      <rect width="24" height="5.33" y="0" fill="#FFFFFF" />
      <rect width="24" height="5.34" y="5.33" fill="#0039A6" />
      <rect width="24" height="5.33" y="10.67" fill="#D52B1E" />
    </svg>
  );
}

const LANGUAGES: Array<{ code: Locale; label: string; name: string }> = [
  { code: "uz", label: "UZ", name: "O‘zbek" },
  { code: "en", label: "EN", name: "English" },
  { code: "ru", label: "RU", name: "Русский" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
      >
        <FlagIcon code={current.code} />
        <span>{current.label}</span>
        <RiArrowDownSLine
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50 dark:border-slate-700 dark:bg-slate-900"
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(lang.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-[#EDF4FA] text-[#1F4E79] dark:bg-[#00C896]/15 dark:text-[#00C896]"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                )}
              >
                <span className="flex items-center gap-2">
                  <FlagIcon code={lang.code} />
                  <span className="font-semibold">{lang.label}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {lang.name}
                  </span>
                </span>
                {active && <RiCheckLine className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
