import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { OrderStatus, Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const status = (searchParams.get("status") || "").trim();

  const where: Prisma.OrderWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as OrderStatus;
  }

  if (q) {
    const cleanQ = q.replace(/^#/, "");
    where.OR = [
      { orderNumber: { contains: cleanQ, mode: "insensitive" } },
      { originalFileName: { contains: cleanQ, mode: "insensitive" } },
      { user: { firstName: { contains: cleanQ, mode: "insensitive" } } },
      { user: { lastName: { contains: cleanQ, mode: "insensitive" } } },
      { user: { phone: { contains: cleanQ, mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      service: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          language: true,
          telegramUsername: true,
          telegramChatId: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ orders });
}
