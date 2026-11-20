import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { initiatePaymentSchema } from "@/lib/validations";
import { paymentService } from "@/lib/payments/service";
import { createUserNotification } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  try {
    const body = await request.json();
    const parsed = initiatePaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "To‘lov ma’lumotlari noto‘g‘ri" },
        { status: 400 }
      );
    }

    const { paymentId, result } = await paymentService.initiatePayment({
      orderId: parsed.data.orderId,
      userId: user.id,
      providerType: parsed.data.provider,
    });

    if (result.instantPaid) {
      const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
      if (order) {
        await createUserNotification({
          userId: user.id,
          orderId: order.id,
          type: "PAYMENT",
          title: `To‘lov qabul qilindi (#${order.orderNumber})`,
          message: "Buyurtmangiz to‘landi va tarjimonlarga topshirildi.",
        });
      }
    }

    return NextResponse.json({ paymentId, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "To‘lovni boshlashda xatolik";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
