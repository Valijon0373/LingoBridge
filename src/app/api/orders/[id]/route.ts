import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      payments: { orderBy: { createdAt: "desc" } },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          language: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  }

  if (order.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
  }

  return NextResponse.json({ order });
}
