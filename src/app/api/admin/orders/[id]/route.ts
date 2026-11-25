import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminUpdateOrderSchema } from "@/lib/validations";
import { createUserNotification, logAdminAction } from "@/lib/audit";
import { markAdminOrderSeen } from "@/lib/settings";
import { notifyUserStatusChange } from "@/lib/telegram/bot-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (body && body.markSeen === true && body.status === undefined && body.adminNote === undefined) {
      await markAdminOrderSeen(id);
      return NextResponse.json({ ok: true });
    }

    const parsed = adminUpdateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Noto‘g‘ri ma’lumot" },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }

    const nextStatus = parsed.data.status ?? existing.status;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
        adminNote: parsed.data.adminNote !== undefined ? parsed.data.adminNote : existing.adminNote,
        completedAt:
          nextStatus === "COMPLETED" && !existing.completedAt
            ? new Date()
            : existing.completedAt,
      },
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
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (nextStatus === "PAID") {
      await prisma.payment.updateMany({
        where: { orderId: id, status: { in: ["PENDING", "WAITING_VERIFICATION"] } },
        data: { status: "SUCCEEDED", verifiedById: admin.id, paidAt: new Date() },
      });
    } else if (nextStatus === "REFUNDED") {
      await prisma.payment.updateMany({
        where: { orderId: id, status: "SUCCEEDED" },
        data: { status: "REFUNDED" },
      });
    }

    await logAdminAction({
      adminId: admin.id,
      orderId: existing.id,
      targetType: "ORDER",
      targetId: existing.id,
      action: "UPDATE_ORDER_STATUS",
      details: {
        orderNumber: existing.orderNumber,
        fromStatus: existing.status,
        toStatus: nextStatus,
        adminNote: parsed.data.adminNote ?? null,
      },
    });

    if (nextStatus !== existing.status) {
      await createUserNotification({
        userId: existing.userId,
        orderId: existing.id,
        type: "ORDER",
        title: `Buyurtma #${existing.orderNumber} holati yangilandi`,
        message: `Yangi holat: ${nextStatus}${parsed.data.adminNote ? `. Izoh: ${parsed.data.adminNote}` : ""}`,
      });

      notifyUserStatusChange({
        telegramChatId: existing.user.telegramChatId,
        language: existing.user.language,
        orderNumber: existing.orderNumber,
        status: nextStatus,
        adminNote: parsed.data.adminNote,
      }).catch((err) => console.error("[Telegram notifyUserStatusChange]", err));
    }

    await markAdminOrderSeen(existing.id);

    return NextResponse.json({ order: { ...updated, isNew: false } });
  } catch (error) {
    console.error("[PATCH /api/admin/orders/[id]]", error);
    return NextResponse.json({ error: "Buyurtmani yangilab bo‘lmadi" }, { status: 500 });
  }
}
