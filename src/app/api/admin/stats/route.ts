import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getAdminSeenOrderIds, isOrderNewForAdmin } from "@/lib/settings";
import type { OrderStatus } from "@prisma/client";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const [
    totalUsers,
    telegramLinkedUsers,
    activeServicesCount,
    totalOrders,
    revenueAgg,
    groupedStatuses,
    servicesWithCounts,
    recentOrders,
    activeOrderStatuses,
    seenIds,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { telegramChatId: { not: null } } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "IN_PROGRESS", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        nameEn: true,
        price: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { nameUz: true, nameRu: true, nameEn: true } },
        user: { select: { firstName: true, lastName: true, phone: true } },
      },
    }),
    prisma.order.findMany({
      where: { status: { in: ["PENDING", "WAITING_PAYMENT", "PAID", "IN_PROGRESS"] } },
      select: { id: true, status: true },
    }),
    getAdminSeenOrderIds(),
  ]);

  const newOrdersCount = activeOrderStatuses.filter((o) =>
    isOrderNewForAdmin(o, seenIds)
  ).length;

  const statusCounts: Record<OrderStatus, number> = {
    PENDING: 0,
    WAITING_PAYMENT: 0,
    PAID: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  };

  for (const row of groupedStatuses) {
    statusCounts[row.status] = row._count.status;
  }

  const serviceBreakdown = servicesWithCounts.map((s) => ({
    id: s.id,
    nameUz: s.nameUz,
    nameRu: s.nameRu,
    nameEn: s.nameEn,
    ordersCount: s._count.orders,
    price: s.price,
  }));

  return NextResponse.json({
    totalUsers,
    telegramLinkedUsers,
    activeServicesCount,
    totalOrders,
    totalRevenue: revenueAgg._sum.totalPrice ?? 0,
    completedOrders: statusCounts.COMPLETED,
    newOrdersCount,
    statusCounts,
    serviceBreakdown,
    recentOrders,
  });
}
