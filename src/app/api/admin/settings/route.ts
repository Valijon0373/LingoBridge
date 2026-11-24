import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { uzPhoneSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/audit";
import { getAppSettingsMap } from "@/lib/settings";

const SETTING_KEYS = [
  "PAYMENT_CARD_NUMBER",
  "PAYMENT_CARD_HOLDER",
  "PAYMENT_CARD_BANK",
  "SUPPORT_PHONE",
  "SUPPORT_TELEGRAM",
] as const;

export async function GET() {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const map = await getAppSettingsMap([...SETTING_KEYS]);

  return NextResponse.json({
    admin,
    settings: {
      paymentCardNumber: map.get("PAYMENT_CARD_NUMBER") || "",
      paymentCardHolder: map.get("PAYMENT_CARD_HOLDER") || "",
      paymentCardBank: map.get("PAYMENT_CARD_BANK") || "",
      supportPhone: map.get("SUPPORT_PHONE") || "",
      supportTelegram: map.get("SUPPORT_TELEGRAM") || "",
    },
  });
}

const updateSettingsSchema = z.object({
  section: z.enum(["profile", "password", "platform"]),
  username: z
    .string()
    .trim()
    .min(3, "Login kamida 3 ta belgi bo‘lishi kerak")
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, "Login faqat harf, raqam va . _ - belgilaridan iborat bo‘lishi kerak")
    .optional(),
  firstName: z.string().trim().min(2).max(60).optional(),
  lastName: z.string().trim().max(60).optional(),
  phone: uzPhoneSchema.optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Yangi parol kamida 6 ta belgi bo‘lishi kerak").optional(),
  paymentCardNumber: z.string().trim().min(8).max(40).optional(),
  paymentCardHolder: z.string().trim().min(2).max(80).optional(),
  paymentCardBank: z.string().trim().min(2).max(60).optional(),
  supportPhone: z.string().trim().min(7).max(40).optional(),
  supportTelegram: z.string().trim().min(3).max(160).optional(),
});

export async function PATCH(request: Request) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  try {
    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Sozlamalar noto‘g‘ri" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.section === "profile") {
      const nextUsername = data.username ? data.username.toLowerCase() : undefined;
      if (nextUsername && nextUsername !== admin.username) {
        const existsUsername = await prisma.user.findFirst({
          where: {
            username: { equals: nextUsername, mode: "insensitive" },
            id: { not: admin.id },
          },
        });
        if (existsUsername) {
          return NextResponse.json(
            { error: "Bu login boshqa hisobda band" },
            { status: 409 }
          );
        }
      }

      if (data.phone && data.phone !== admin.phone) {
        const exists = await prisma.user.findUnique({ where: { phone: data.phone } });
        if (exists && exists.id !== admin.id) {
          return NextResponse.json(
            { error: "Bu telefon raqam boshqa hisobda band" },
            { status: 409 }
          );
        }
      }

      const updated = await prisma.user.update({
        where: { id: admin.id },
        data: {
          ...(nextUsername ? { username: nextUsername } : {}),
          ...(data.firstName ? { firstName: data.firstName } : {}),
          ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        },
        select: { id: true, username: true, firstName: true, lastName: true, phone: true, role: true },
      });

      await logAdminAction({
        adminId: admin.id,
        targetType: "USER",
        targetId: admin.id,
        action: "UPDATE_ADMIN_PROFILE",
      });

      return NextResponse.json({ admin: updated });
    }

    if (data.section === "password") {
      if (!data.currentPassword || !data.newPassword) {
        return NextResponse.json(
          { error: "Joriy parol va yangi parolni kiriting" },
          { status: 400 }
        );
      }

      const fullAdmin = await prisma.user.findUnique({ where: { id: admin.id } });
      if (!fullAdmin?.passwordHash) {
        return NextResponse.json({ error: "Hisob paroli topilmadi" }, { status: 400 });
      }

      const ok = await verifyPassword(data.currentPassword, fullAdmin.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Joriy parol noto‘g‘ri" },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(data.newPassword);
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash },
      });

      await logAdminAction({
        adminId: admin.id,
        targetType: "USER",
        targetId: admin.id,
        action: "CHANGE_ADMIN_PASSWORD",
      });

      return NextResponse.json({ ok: true });
    }

    // Platform settings
    const updates: Array<[string, string]> = [];
    if (data.paymentCardNumber) updates.push(["PAYMENT_CARD_NUMBER", data.paymentCardNumber]);
    if (data.paymentCardHolder) updates.push(["PAYMENT_CARD_HOLDER", data.paymentCardHolder]);
    if (data.paymentCardBank) updates.push(["PAYMENT_CARD_BANK", data.paymentCardBank]);
    if (data.supportPhone) updates.push(["SUPPORT_PHONE", data.supportPhone]);
    if (data.supportTelegram) updates.push(["SUPPORT_TELEGRAM", data.supportTelegram]);

    await Promise.all(
      updates.map(([key, value]) =>
        prisma.appSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    await logAdminAction({
      adminId: admin.id,
      targetType: "USER",
      action: "UPDATE_PLATFORM_SETTINGS",
      details: { keys: updates.map(([k]) => k) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/admin/settings]", error);
    return NextResponse.json(
      { error: "Sozlamalarni saqlab bo‘lmadi" },
      { status: 500 }
    );
  }
}
