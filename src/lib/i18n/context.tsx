"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/utils";
import { dictionaries, type Dictionary } from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "uz",
  setLocale: () => {},
  t: dictionaries.uz,
});

const STORAGE_KEY = "lb_locale";

export function I18nProvider({
  children,
  initialLocale = "uz",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === "uz" || saved === "ru" || saved === "en")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `lb_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
