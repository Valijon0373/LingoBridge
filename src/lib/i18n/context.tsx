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

export function I18nProvider({
  children,
  initialLocale = "uz",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Clean up any legacy localStorage preference key once on mount
  useEffect(() => {
    try {
      window.localStorage.removeItem("lb_locale");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    void fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    }).catch(() => {});
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
