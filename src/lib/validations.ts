import { z } from "zod";
import { normalizeUzPhone } from "./utils";

export const uzPhoneSchema = z
  .string()
  .trim()
  .refine((val) => normalizeUzPhone(val) !== null, {
    message: "Telefon raqam +998 XX XXX XX XX formatida bo‘lishi kerak",
  })
  .transform((val) => normalizeUzPhone(val)!);

export const languageEnumSchema = z.enum(["UZ", "RU", "EN"]);
export const pricingTypeSchema = z.enum(["PER_PAGE", "FIXED"]);
export const orderStatusSchema = z.enum([
  "PENDING",
  "WAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

export const registerSchema = z.object({
  phone: uzPhoneSchema,
  firstName: z.string().trim().min(2, "Ism kamida 2 ta harfdan iborat bo‘lishi kerak").max(60),
  lastName: z.string().trim().min(2, "Familiya kamida 2 ta harfdan iborat bo‘lishi kerak").max(60),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo‘lishi kerak").max(100),
  language: languageEnumSchema.optional().default("UZ"),
});

export const loginSchema = z.object({
  phone: uzPhoneSchema,
  password: z.string().min(1, "Parolni kiriting"),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: uzPhoneSchema,
  language: languageEnumSchema,
});

export const createOrderSchema = z
  .object({
    serviceId: z.string().min(1, "Xizmatni tanlang"),
    sourceLanguage: languageEnumSchema,
    targetLanguage: languageEnumSchema,
    pageCount: z.coerce.number().int().min(1, "Sahifalar soni kamida 1 bo‘lishi kerak").max(5000),
    customerNote: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.sourceLanguage !== data.targetLanguage, {
    message: "Manba va maqsad tillar bir xil bo‘lishi mumkin emas",
    path: ["targetLanguage"],
  });

export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(["CARD_TRANSFER", "CLICK", "PAYME", "MOCK"]),
});

export const adminUpdateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  adminNote: z.string().trim().max(2000).optional(),
});

export const serviceCreateSchema = z.object({
  nameUz: z.string().trim().min(2).max(120),
  nameRu: z.string().trim().min(2).max(120),
  nameEn: z.string().trim().min(2).max(120),
  descriptionUz: z.string().trim().min(5).max(800),
  descriptionRu: z.string().trim().min(5).max(800),
  descriptionEn: z.string().trim().min(5).max(800),
  price: z.coerce.number().int().min(1000).max(100000000),
  pricingType: pricingTypeSchema,
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const broadcastSchema = z.object({
  title: z.string().trim().min(3, "Sarlavha kamida 3 ta belgi").max(140),
  message: z.string().trim().min(5, "Xabar matni kamida 5 ta belgi").max(4000),
  sendToTelegram: z.boolean().optional().default(true),
});
