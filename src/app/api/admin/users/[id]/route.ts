import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { languageEnumSchema, uzPhoneSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/audit";

const adminUpdateUserSchema = z.object({
  firstName: z.string().trim().min(2, "Ism kamida 2 ta harf bo‘lishi kerak").max(60),
  lastName: z.string().trim().max(60).optional().default(""),
  phone: uzPhoneSchema,
  role: z.enum(["USER", "ADMIN"]),
  language: languageEnumSchema,
  isActive: z.boolean().optional().default(true),
  newPassword: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined))
    .refine((v) => !v || v.length >= 6, {
      message: "Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak",
    }),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = adminUpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ma’lumotlar noto‘g‘ri" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    if (existing.id === admin.id && (parsed.data.role !== "ADMIN" || !parsed.data.isActive)) {
      return NextResponse.json(
        { error: "O‘zingizning joriy administrator huquqingizni o‘chira olmaysiz" },
        { status: 400 }
      );
    }

    if (parsed.data.phone !== existing.phone) {
      const taken = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
      if (taken && taken.id !== id) {
        return NextResponse.json(
          { error: "Ushbu telefon raqam boshqa foydalanuvchida band" },
          { status: 409 }
        );
      }
    }

    const passwordHash = parsed.data.newPassword
      ? await hashPassword(parsed.data.newPassword)
      : undefined;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        role: parsed.data.role,
        language: parsed.data.language,
        isActive: parsed.data.isActive,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        telegramUsername: true,
        telegramChatId: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    await logAdminAction({
      adminId: admin.id,
      targetType: "USER",
      targetId: updated.id,
      action: "UPDATE_USER",
      details: {
        name: `${updated.firstName} ${updated.lastName}`.trim(),
        phone: updated.phone,
        role: updated.role,
        isActive: updated.isActive,
        passwordChanged: Boolean(passwordHash),
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]]", error);
    return NextResponse.json(
      { error: "Foydalanuvchini yangilab bo‘lmadi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const { id } = await context.params;

  if (id === admin.id) {
    return NextResponse.json(
      { error: "O‘zingizning joriy admin hisobingizni o‘chira olmaysiz" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, phone: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await logAdminAction({
      adminId: admin.id,
      targetType: "USER",
      targetId: id,
      action: "DELETE_USER",
      details: {
        name: `${existing.firstName} ${existing.lastName}`.trim(),
        phone: existing.phone,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]]", error);
    return NextResponse.json(
      { error: "Foydalanuvchini o‘chirib bo‘lmadi" },
      { status: 500 }
    );
  }
}
