import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { languageEnumToLocale, localeToLanguageEnum } from "@/lib/utils";

const preferencesPatchSchema = z.object({
  locale: z.enum(["uz", "ru", "en"]).optional(),
  adminDarkMode: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("lb_locale")?.value;

  let locale: "uz" | "ru" | "en" =
    cookieLocale === "ru" || cookieLocale === "en" ? cookieLocale : "uz";
  let adminDarkMode = false;

  if (user) {
    locale = languageEnumToLocale(user.language);
    if (user.role === "ADMIN") {
      const darkSetting = await prisma.appSetting.findUnique({
        where: { key: `ADMIN_DARK_MODE_${user.id}` },
      });
      adminDarkMode = darkSetting?.value === "1";
    }
  }

  return NextResponse.json({ locale, adminDarkMode });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = preferencesPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Noto‘g‘ri parametrlar" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const { locale, adminDarkMode } = parsed.data;

    if (locale) {
      const cookieStore = await cookies();
      cookieStore.set("lb_locale", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { language: localeToLanguageEnum(locale) },
        });
      }
    }

    if (typeof adminDarkMode === "boolean" && user && user.role === "ADMIN") {
      await prisma.appSetting.upsert({
        where: { key: `ADMIN_DARK_MODE_${user.id}` },
        update: { value: adminDarkMode ? "1" : "0" },
        create: {
          key: `ADMIN_DARK_MODE_${user.id}`,
          value: adminDarkMode ? "1" : "0",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/preferences]", error);
    return NextResponse.json({ error: "Sozlamani saqlab bo‘lmadi" }, { status: 500 });
  }
}
