import crypto from "crypto";
import type {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentWebhookResult,
} from "./types";

export function getCardTransferDetails() {
  return {
    cardNumber: process.env.PAYMENT_CARD_NUMBER || "8600 0000 0000 0000",
    cardHolder: process.env.PAYMENT_CARD_HOLDER || "LINGO BRIDGE MCHJ",
    bankName: process.env.PAYMENT_CARD_BANK || "Uzcard / Humo",
  };
}

/**
 * 1. Manual Card Transfer + Receipt Upload Provider
 */
export class CardTransferProvider implements PaymentProvider {
  readonly type = "CARD_TRANSFER" as const;
  readonly isConfigured = true;

  async initiate(): Promise<PaymentInitiationResult> {
    return {
      provider: "CARD_TRANSFER",
      status: "PENDING",
      requiresReceiptUpload: true,
      cardDetails: getCardTransferDetails(),
      message: "Karta raqamiga to‘lovni amalga oshiring va chekni yuklang.",
    };
  }
}

/**
 * 2. Click.uz Payment Gateway Provider (Modular Ready)
 */
export class ClickPaymentProvider implements PaymentProvider {
  readonly type = "CLICK" as const;

  get isConfigured(): boolean {
    return Boolean(
      process.env.CLICK_MERCHANT_ID &&
        process.env.CLICK_SERVICE_ID &&
        process.env.CLICK_SECRET_KEY
    );
  }

  async initiate(req: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    if (!this.isConfigured) {
      throw new Error("Click.uz sozlamalari (.env) to‘liq kiritilmagan");
    }

    const params = new URLSearchParams({
      service_id: process.env.CLICK_SERVICE_ID!,
      merchant_id: process.env.CLICK_MERCHANT_ID!,
      amount: String(req.amount),
      transaction_param: req.orderNumber,
      return_url: req.returnUrl,
    });

    if (process.env.CLICK_MERCHANT_USER_ID) {
      params.set("merchant_user_id", process.env.CLICK_MERCHANT_USER_ID);
    }

    return {
      provider: "CLICK",
      status: "PENDING",
      externalId: `click_${req.orderNumber}`,
      checkoutUrl: `https://my.click.uz/services/pay?${params.toString()}`,
    };
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<PaymentWebhookResult> {
    const secret = process.env.CLICK_SECRET_KEY || "";
    const clickTransId = String(payload.click_trans_id ?? "");
    const serviceId = String(payload.service_id ?? "");
    const merchantTransId = String(payload.merchant_trans_id ?? "");
    const amount = String(payload.amount ?? "");
    const action = String(payload.action ?? "");
    const signTime = String(payload.sign_time ?? "");
    const signString = String(payload.sign_string ?? "");
    const merchantPrepareId = String(payload.merchant_prepare_id ?? "");

    const raw =
      action === "1"
        ? `${clickTransId}${serviceId}${secret}${merchantTransId}${merchantPrepareId}${amount}${action}${signTime}`
        : `${clickTransId}${serviceId}${secret}${merchantTransId}${amount}${action}${signTime}`;

    const expectedSign = crypto.createHash("md5").update(raw).digest("hex");
    if (!secret || expectedSign !== signString) {
      return {
        valid: false,
        responseBody: { error: -1, error_note: "SIGN CHECK FAILED" },
      };
    }

    return {
      valid: true,
      externalId: clickTransId,
      status: action === "1" ? "SUCCEEDED" : "PENDING",
      responseBody: {
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_prepare_id: merchantPrepareId || clickTransId,
        error: 0,
        error_note: "Success",
      },
    };
  }
}

/**
 * 3. Payme Payment Gateway Provider (Modular Ready)
 */
export class PaymePaymentProvider implements PaymentProvider {
  readonly type = "PAYME" as const;

  get isConfigured(): boolean {
    return Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_SECRET_KEY);
  }

  async initiate(req: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    if (!this.isConfigured) {
      throw new Error("Payme sozlamalari (.env) to‘liq kiritilmagan");
    }

    const amountTiyin = req.amount * 100;
    const rawParams = `m=${process.env.PAYME_MERCHANT_ID};ac.order_number=${req.orderNumber};a=${amountTiyin};c=${req.returnUrl}`;
    const encoded = Buffer.from(rawParams).toString("base64");
    const host =
      process.env.PAYME_TEST_MODE === "true"
        ? "https://test.paycom.uz"
        : "https://checkout.paycom.uz";

    return {
      provider: "PAYME",
      status: "PENDING",
      externalId: `payme_${req.orderNumber}`,
      checkoutUrl: `${host}/${encoded}`,
    };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    headers: Headers
  ): Promise<PaymentWebhookResult> {
    const authHeader = headers.get("authorization") || "";
    const secret = process.env.PAYME_SECRET_KEY || "";
    const expected = "Basic " + Buffer.from(`Paycom:${secret}`).toString("base64");

    if (!secret || authHeader !== expected) {
      return {
        valid: false,
        responseBody: {
          error: { code: -32504, message: "Insufficient privilege to perform this method" },
        },
      };
    }

    const method = String(payload.method ?? "");
    return {
      valid: true,
      status: method === "PerformTransaction" ? "SUCCEEDED" : "PENDING",
      responseBody: {
        result: { allow: true, method },
      },
    };
  }
}

/**
 * 4. Mock Test Payment Provider (Dev / Sandbox Testing)
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly type = "MOCK" as const;

  get isConfigured(): boolean {
    return process.env.PAYMENT_MOCK_ENABLED !== "false";
  }

  async initiate(req: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    if (!this.isConfigured) {
      throw new Error("Mock to‘lov rejimi o‘chirilgan");
    }

    return {
      provider: "MOCK",
      status: "SUCCEEDED",
      externalId: `mock_${crypto.randomBytes(6).toString("hex")}`,
      instantPaid: true,
      message: "Test to‘lovi muvaffaqiyatli amalga oshirildi.",
    };
  }
}
