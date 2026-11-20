import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/service";
import { prisma } from "@/lib/prisma";
import type { PaymentProviderType } from "@prisma/client";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await context.params;
  const providerKey = rawProvider.toUpperCase() as PaymentProviderType;

  if (providerKey !== "CLICK" && providerKey !== "PAYME") {
    return NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 });
  }

  try {
    const provider = paymentService.getProvider(providerKey);
    if (!provider.handleWebhook) {
      return NextResponse.json({ error: "Webhook not supported" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";
    let payload: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      payload = (await request.json()) as Record<string, unknown>;
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    }

    const result = await provider.handleWebhook(payload, request.headers);

    if (result.valid && result.status === "SUCCEEDED" && payload.merchant_trans_id) {
      const orderNumber = String(payload.merchant_trans_id);
      const order = await prisma.order.findUnique({ where: { orderNumber } });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
        await prisma.payment.updateMany({
          where: { orderId: order.id, provider: providerKey },
          data: { status: "SUCCEEDED", externalId: result.externalId, paidAt: new Date() },
        });
      }
    }

    return NextResponse.json(result.responseBody ?? { ok: result.valid });
  } catch (error) {
    console.error(`[POST /api/payments/webhook/${rawProvider}]`, error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
