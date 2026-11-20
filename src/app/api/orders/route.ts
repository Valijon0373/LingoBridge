import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  countPdfPages,
  isPdfFile,
  validateUploadedFile,
} from "@/lib/pdf";
import { getStorageProvider } from "@/lib/storage";
import { calculateOrderPrice, generateOrderNumber } from "@/lib/utils";
import { notifyAdminsNewOrder } from "@/lib/telegram/bot-service";
import { createUserNotification } from "@/lib/audit";

export async function GET() {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      service: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Hujjat faylini yuklash majburiy" }, { status: 400 });
    }

    const fileValidation = validateUploadedFile(
      file.name,
      file.size,
      ALLOWED_DOCUMENT_EXTENSIONS
    );
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const parsed = createOrderSchema.safeParse({
      serviceId: formData.get("serviceId"),
      sourceLanguage: formData.get("sourceLanguage"),
      targetLanguage: formData.get("targetLanguage"),
      pageCount: formData.get("pageCount") ?? 1,
      customerNote: formData.get("customerNote") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Buyurtma ma’lumotlari noto‘g‘ri" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findFirst({
      where: { id: parsed.data.serviceId, isActive: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Tanlangan xizmat topilmadi yoki faol emas" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let finalPageCount = parsed.data.pageCount;
    let autoDetectedPages = false;

    // Server-side authoritative PDF page counting
    if (service.pricingType === "FIXED") {
      finalPageCount = 1;
    } else if (isPdfFile(file.name, file.type)) {
      const pdfResult = await countPdfPages(buffer);
      if (pdfResult.pageCount && pdfResult.pageCount > 0) {
        finalPageCount = pdfResult.pageCount;
        autoDetectedPages = true;
      }
    }

    // Server-only price calculation (never trusts client)
    const { normalizedPages, totalPrice } = calculateOrderPrice(
      service.price,
      service.pricingType,
      finalPageCount
    );

    const storage = getStorageProvider();
    const stored = await storage.upload({
      folder: "originals",
      originalName: file.name,
      buffer,
      mimeType: file.type,
    });

    // Generate unique order number (#LB-XXXX)
    let orderNumber = generateOrderNumber();
    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await prisma.order.findUnique({ where: { orderNumber } });
      if (!exists) break;
      orderNumber = generateOrderNumber();
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        serviceId: service.id,
        sourceLanguage: parsed.data.sourceLanguage,
        targetLanguage: parsed.data.targetLanguage,
        originalFileName: stored.fileName,
        originalFileKey: stored.key,
        originalFileMime: stored.mimeType,
        originalFileSize: stored.size,
        pageCount: normalizedPages,
        autoDetectedPages,
        unitPrice: service.price,
        pricingType: service.pricingType,
        totalPrice,
        status: "WAITING_PAYMENT",
        source: "WEB",
        customerNote: parsed.data.customerNote,
      },
      include: {
        service: true,
        payments: true,
      },
    });

    await createUserNotification({
      userId: user.id,
      orderId: order.id,
      type: "ORDER",
      title: `Yangi buyurtma #${order.orderNumber} yaratildi`,
      message: `${service.nameUz} (${normalizedPages} sahifa) — to‘lov kutilmoqda.`,
    });

    // Notify admins on Telegram asynchronously
    notifyAdminsNewOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phone,
      serviceName: service.nameUz,
      sourceLanguage: order.sourceLanguage,
      targetLanguage: order.targetLanguage,
      pageCount: order.pageCount,
      totalPrice: order.totalPrice,
      fileName: order.originalFileName,
    }).catch((err) => console.error("[Telegram notifyAdminsNewOrder]", err));

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { error: "Buyurtma yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
