import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ALLOWED_RECEIPT_EXTENSIONS, validateUploadedFile } from "@/lib/pdf";
import { getStorageProvider } from "@/lib/storage";
import { notifyAdminsReceiptUploaded } from "@/lib/telegram/bot-service";
import { createUserNotification } from "@/lib/audit";

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  try {
    const formData = await request.formData();
    const orderId = String(formData.get("orderId") || "");
    const file = formData.get("receipt");

    if (!orderId) {
      return NextResponse.json({ error: "Buyurtma ID ko‘rsatilmagan" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "To‘lov cheki faylini tanlang" }, { status: 400 });
    }

    const validation = validateUploadedFile(
      file.name,
      file.size,
      ALLOWED_RECEIPT_EXTENSIONS
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    const stored = await storage.upload({
      folder: "receipts",
      originalName: file.name,
      buffer,
      mimeType: file.type,
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: user.id,
        provider: "CARD_TRANSFER",
        status: "WAITING_VERIFICATION",
        amount: order.totalPrice,
        receiptFileName: stored.fileName,
        receiptFileKey: stored.key,
      },
    });

    // Move order to IN_PROGRESS per business flow upon receipt upload
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "IN_PROGRESS" },
      include: {
        service: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    await createUserNotification({
      userId: user.id,
      orderId: order.id,
      type: "PAYMENT",
      title: `To‘lov cheki yuklandi (#${order.orderNumber})`,
      message: "Chekingiz adminga yuborildi. Buyurtma tekshirish va tarjima jarayoniga o‘tkazildi.",
    });

    // Notify admins on Telegram with the actual receipt file
    notifyAdminsReceiptUploaded({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phone,
      totalPrice: order.totalPrice,
      receiptFileName: stored.fileName,
      receiptBuffer: buffer,
    }).catch((err) => console.error("[Telegram notifyAdminsReceiptUploaded]", err));

    return NextResponse.json({ payment, order: updatedOrder }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/payments/receipt]", error);
    return NextResponse.json({ error: "Chekni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
