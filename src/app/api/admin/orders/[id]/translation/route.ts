import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ALLOWED_TRANSLATION_EXTENSIONS, validateUploadedFile } from "@/lib/pdf";
import { getStorageProvider } from "@/lib/storage";
import { createUserNotification, logAdminAction } from "@/lib/audit";
import { markAdminOrderSeen } from "@/lib/settings";
import { notifyUserOrderCompleted } from "@/lib/telegram/bot-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const adminNote = formData.get("adminNote")
      ? String(formData.get("adminNote"))
      : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Tayyor tarjima faylini tanlang" }, { status: 400 });
    }

    const validation = validateUploadedFile(
      file.name,
      file.size,
      ALLOWED_TRANSLATION_EXTENSIONS
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    const stored = await storage.upload({
      folder: "translations",
      originalName: file.name,
      buffer,
      mimeType: file.type,
    });

    // Deliver completed translation to Telegram if user linked their account
    const telegramFileId = await notifyUserOrderCompleted({
      telegramChatId: existing.user.telegramChatId,
      language: existing.user.language,
      orderNumber: existing.orderNumber,
      translatedFileName: stored.fileName,
      translatedBuffer: buffer,
    }).catch((err) => {
      console.error("[Telegram notifyUserOrderCompleted]", err);
      return null;
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        translatedFileName: stored.fileName,
        translatedFileKey: stored.key,
        translatedTelegramFileId: telegramFileId ?? undefined,
        status: "COMPLETED",
        completedAt: new Date(),
        adminNote: adminNote ?? existing.adminNote,
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

    await createUserNotification({
      userId: existing.userId,
      orderId: existing.id,
      type: "ORDER",
      title: `Tayyor tarjima yuklandi (#${existing.orderNumber})`,
      message: `Buyurtmangiz tugallandi! "${stored.fileName}" faylini yuklab olishingiz mumkin.`,
    });

    await logAdminAction({
      adminId: admin.id,
      orderId: existing.id,
      targetType: "ORDER",
      targetId: existing.id,
      action: "UPLOAD_TRANSLATION",
      details: {
        orderNumber: existing.orderNumber,
        translatedFileName: stored.fileName,
        deliveredViaTelegram: Boolean(existing.user.telegramChatId),
      },
    });

    await markAdminOrderSeen(existing.id);

    return NextResponse.json({ order: { ...updated, isNew: false } });
  } catch (error) {
    console.error("[POST /api/admin/orders/[id]/translation]", error);
    return NextResponse.json({ error: "Tarjima faylini yuklab bo‘lmadi" }, { status: 500 });
  }
}
