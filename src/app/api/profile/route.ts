import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";

export async function GET() {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const [orderStats, paidSum, completedCount] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.aggregate({
      where: {
        userId: user.id,
        status: { in: ["PAID", "IN_PROGRESS", "COMPLETED"] },
      },
      _sum: { totalPrice: true },
    }),
    prisma.order.count({
      where: { userId: user.id, status: "COMPLETED" },
    }),
  ]);

  return NextResponse.json({
    user,
    stats: {
      totalOrders: orderStats,
      totalSpent: paidSum._sum.totalPrice ?? 0,
      completedOrders: completedCount,
    },
  });
}

export async function PATCH(request: Request) {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ma’lumotlar noto‘g‘ri" },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, language } = parsed.data;

    if (phone !== user.phone) {
      const taken = await prisma.user.findUnique({ where: { phone } });
      if (taken && taken.id !== user.id) {
        return NextResponse.json(
          { error: "Ushbu telefon raqam boshqa foydalanuvchiga biriktirilgan" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName, phone, language },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        telegramId: true,
        telegramUsername: true,
        telegramChatId: true,
      },
    });

    return NextResponse.json({
      user: {
        ...updated,
        telegramId: updated.telegramId ? updated.telegramId.toString() : null,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/profile]", error);
    return NextResponse.json({ error: "Profilni yangilab bo‘lmadi" }, { status: 500 });
  }
}
