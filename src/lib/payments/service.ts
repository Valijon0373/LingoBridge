import type { PaymentProviderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CardTransferProvider,
  ClickPaymentProvider,
  MockPaymentProvider,
  PaymePaymentProvider,
  getCardTransferDetails,
} from "./providers";
import type { PaymentInitiationResult, PaymentProvider } from "./types";

class PaymentServiceImpl {
  private providers: Map<PaymentProviderType, PaymentProvider>;

  constructor() {
    this.providers = new Map<PaymentProviderType, PaymentProvider>([
      ["CARD_TRANSFER", new CardTransferProvider()],
      ["CLICK", new ClickPaymentProvider()],
      ["PAYME", new PaymePaymentProvider()],
      ["MOCK", new MockPaymentProvider()],
    ]);
  }

  getProvider(type: PaymentProviderType): PaymentProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Unsupported payment provider: ${type}`);
    }
    return provider;
  }

  async getAvailableMethods() {
    const cardDetails = await getCardTransferDetails();
    return {
      cardTransfer: {
        enabled: true,
        ...cardDetails,
      },
      click: {
        enabled: this.getProvider("CLICK").isConfigured,
      },
      payme: {
        enabled: this.getProvider("PAYME").isConfigured,
      },
      mock: {
        enabled: this.getProvider("MOCK").isConfigured,
      },
    };
  }

  async initiatePayment(params: {
    orderId: string;
    userId: string;
    providerType: PaymentProviderType;
  }): Promise<{ paymentId: string; result: PaymentInitiationResult }> {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { service: true },
    });

    if (!order || order.userId !== params.userId) {
      throw new Error("Buyurtma topilmadi");
    }

    if (order.status === "PAID" || order.status === "COMPLETED") {
      throw new Error("Ushbu buyurtma allaqachon to‘langan");
    }

    const provider = this.getProvider(params.providerType);
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: params.userId,
        provider: params.providerType,
        status: "PENDING",
        amount: order.totalPrice, // Always use server-computed order total
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const result = await provider.initiate({
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalPrice,
      returnUrl: `${appUrl}/dashboard?paid=${encodeURIComponent(order.orderNumber)}`,
      description: `Lingo Bridge #${order.orderNumber} — ${order.service.nameUz}`,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.status,
        externalId: result.externalId,
        paidAt: result.instantPaid ? new Date() : undefined,
      },
    });

    if (result.instantPaid) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    }

    return { paymentId: payment.id, result };
  }
}

export const paymentService = new PaymentServiceImpl();
export { getCardTransferDetails };
