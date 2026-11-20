import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { broadcastSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/audit";
import { broadcastToTelegramUsers } from "@/lib/telegram/bot-service";

export async function POST(request: Request) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  try {
    const body = await request.json();
    const parsed = broadcastSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Xabar ma’lumotlari noto‘g‘ri" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, telegramChatId: true },
    });

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          title: parsed.data.title,
          message: parsed.data.message,
          type: "BROADCAST",
        })),
      });
    }

    let telegramResult = { sent: 0, failed: 0 };
    if (parsed.data.sendToTelegram) {
      const chatIds = users
        .map((u) => u.telegramChatId)
        .filter((id): id is string => Boolean(id));
      if (chatIds.length > 0) {
        telegramResult = await broadcastToTelegramUsers({
          chatIds,
          title: parsed.data.title,
          message: parsed.data.message,
        });
      }
    }

    await logAdminAction({
      adminId: admin.id,
      targetType: "BROADCAST",
      action: "SEND_BROADCAST",
      details: {
        title: parsed.data.title,
        inAppRecipients: users.length,
        telegramSent: telegramResult.sent,
        telegramFailed: telegramResult.failed,
      },
    });

    return NextResponse.json({
      inAppRecipients: users.length,
      telegram: telegramResult,
    });
  } catch (error) {
    console.error("[POST /api/admin/broadcast]", error);
    return NextResponse.json({ error: "Xabarnoma yuborishda xatolik" }, { status: 500 });
  }
}
