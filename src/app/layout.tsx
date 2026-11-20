import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppChrome } from "@/components/layout/AppChrome";
import type { Locale } from "@/lib/utils";

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
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("lb_locale")?.value;
  const initialLocale: Locale =
    rawLocale === "ru" || rawLocale === "en" ? rawLocale : "uz";

  return (
    <html lang={initialLocale}>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900">
        <I18nProvider initialLocale={initialLocale}>
          <AuthProvider>
            <AppChrome>{children}</AppChrome>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
