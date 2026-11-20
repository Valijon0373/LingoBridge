import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
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

  return NextResponse.json({ users });
}
