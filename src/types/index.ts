import type { Language, OrderSource, OrderStatus, PaymentProviderType, PaymentStatus, PricingType, Role } from "@prisma/client";

export interface UserDTO {
  id: string;
  username?: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: Role;
  language: Language;
  telegramId?: string | null;
  telegramUsername?: string | null;
  telegramChatId?: string | null;
  createdAt?: string;
}

export interface ServiceDTO {
  id: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  price: number;
  pricingType: PricingType;
  isActive: boolean;
  sortOrder: number;
  _count?: { orders: number };
}

export interface PaymentDTO {
  id: string;
  orderId: string;
  provider: PaymentProviderType;
  status: PaymentStatus;
  amount: number;
  externalId: string | null;
  receiptFileName: string | null;
  receiptFileKey: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  userId: string;
  serviceId: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  originalFileName: string;
  originalFileKey: string;
  originalFileMime: string | null;
  originalFileSize: number | null;
  pageCount: number;
  autoDetectedPages: boolean;
  unitPrice: number;
  pricingType: PricingType;
  totalPrice: number;
  status: OrderStatus;
  source: OrderSource;
  customerNote: string | null;
  adminNote: string | null;
  translatedFileName: string | null;
  translatedFileKey: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
  service: ServiceDTO;
  payments: PaymentDTO[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    language: Language;
    telegramUsername?: string | null;
    telegramChatId?: string | null;
  };
}

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  orderId: string | null;
  createdAt: string;
}

export interface AdminActionDTO {
  id: string;
  targetType: string;
  targetId: string | null;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  admin: {
    firstName: string;
    lastName: string;
    phone: string | null;
  };
  order: {
    orderNumber: string;
  } | null;
}

export interface PaymentMethodsDTO {
  cardTransfer: {
    enabled: boolean;
    cardNumber: string;
    cardHolder: string;
    bankName: string;
  };
  click: { enabled: boolean };
  payme: { enabled: boolean };
  mock: { enabled: boolean };
}
