import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const logs = await prisma.adminAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      admin: {
        select: { firstName: true, lastName: true, phone: true },
      },
      order: {
        select: { orderNumber: true },
      },
    },
  });

  return NextResponse.json({ logs });
}
