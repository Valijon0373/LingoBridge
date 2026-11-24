import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppChrome } from "@/components/layout/AppChrome";
import { getCurrentUser } from "@/lib/auth";
import { getPublicSettings } from "@/lib/settings";
import { languageEnumToLocale, type Locale } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lingo Bridge — Akademik va Rasmiy Hujjatlar Tarjimasi",
  description:
    "Avtoreferat, dissertatsiya va rasmiy hujjatlarni onlayn tarjima qilish, PDF sahifalarini avtomatik hisoblash va Telegram bot orqali tezkor yetkazib berish platformasi.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieStore, currentUser, publicSettings] = await Promise.all([
    cookies(),
    getCurrentUser(),
    getPublicSettings(),
  ]);

  const rawLocale = cookieStore.get("lb_locale")?.value;
  const cookieLocale: Locale =
    rawLocale === "ru" || rawLocale === "en" ? rawLocale : "uz";
  const initialLocale: Locale = currentUser
    ? languageEnumToLocale(currentUser.language)
    : cookieLocale;

  return (
    <html lang={initialLocale}>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900">
        <I18nProvider initialLocale={initialLocale}>
          <AuthProvider>
            <AppChrome publicSettings={publicSettings}>{children}</AppChrome>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
