import type { PaymentProviderType, PaymentStatus } from "@prisma/client";

export interface PaymentInitiationRequest {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  amount: number; // in UZS
  returnUrl: string;
  description: string;
}

export interface PaymentInitiationResult {
  provider: PaymentProviderType;
  status: PaymentStatus;
  checkoutUrl?: string;
  externalId?: string;
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    bankName: string;
  };
  requiresReceiptUpload?: boolean;
  instantPaid?: boolean;
  message?: string;
}

export interface PaymentWebhookResult {
  valid: boolean;
  paymentId?: string;
  orderId?: string;
  externalId?: string;
  status?: PaymentStatus;
  responseBody?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly type: PaymentProviderType;
  readonly isConfigured: boolean;
  initiate(req: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  handleWebhook?(payload: Record<string, unknown>, headers: Headers): Promise<PaymentWebhookResult>;
}
