import type { OrderStatus } from "@prisma/client";
import { prisma } from "./prisma";

const ADMIN_SEEN_ORDERS_KEY = "ADMIN_SEEN_ORDER_IDS";
const NEW_ELIGIBLE_STATUSES = new Set<OrderStatus>([
  "PENDING",
  "WAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
]);

export async function getAdminSeenOrderIds(): Promise<Set<string>> {
  const row = await prisma.appSetting.findUnique({
    where: { key: ADMIN_SEEN_ORDERS_KEY },
  });
  if (!row?.value) return new Set();
  try {
    const parsed = JSON.parse(row.value) as unknown;
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((v): v is string => typeof v === "string"));
    }
  } catch {
    // Ignore malformed JSON
  }
  return new Set();
}

export async function markAdminOrderSeen(orderId: string): Promise<void> {
  const seen = await getAdminSeenOrderIds();
  if (seen.has(orderId)) return;
  seen.add(orderId);
  // Keep recent 1000 IDs so the setting stays compact
  const list = Array.from(seen).slice(-1000);
  await prisma.appSetting.upsert({
    where: { key: ADMIN_SEEN_ORDERS_KEY },
    update: { value: JSON.stringify(list) },
    create: { key: ADMIN_SEEN_ORDERS_KEY, value: JSON.stringify(list) },
  });
}

export function isOrderNewForAdmin(
  order: { id: string; status: OrderStatus },
  seenIds: Set<string>
): boolean {
  return NEW_ELIGIBLE_STATUSES.has(order.status) && !seenIds.has(order.id);
}

export interface PublicPlatformSettings {
  supportPhone: string;
  supportTelegram: string;
  telegramBotUsername: string;
}

export interface PaymentCardSettings {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
}

const DEFAULT_DB_SETTINGS: Record<string, string> = {
  PAYMENT_CARD_NUMBER: process.env.PAYMENT_CARD_NUMBER || "8600 0000 0000 0000",
  PAYMENT_CARD_HOLDER: process.env.PAYMENT_CARD_HOLDER || "LINGO BRIDGE MCHJ",
  PAYMENT_CARD_BANK: process.env.PAYMENT_CARD_BANK || "Uzcard / Humo",
  SUPPORT_PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+998 90 123 45 67",
  SUPPORT_TELEGRAM: process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "https://t.me/lingobridge_admin",
  TELEGRAM_BOT_USERNAME: (
    process.env.TELEGRAM_BOT_USERNAME ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
    "lingo_bridge_spin_bot"
  ).replace(/^@/, ""),
};

export async function getAppSettingsMap(keys: string[]): Promise<Map<string, string>> {
  const rows = await prisma.appSetting.findMany({
    where: { key: { in: keys } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  // Persist initial defaults to DB if any key is missing so DB is the single source of truth
  const missingKeys = keys.filter((k) => !map.has(k) && DEFAULT_DB_SETTINGS[k]);
  if (missingKeys.length > 0) {
    await Promise.all(
      missingKeys.map(async (key) => {
        const value = DEFAULT_DB_SETTINGS[key];
        await prisma.appSetting.upsert({
          where: { key },
          update: {},
          create: { key, value },
        });
        map.set(key, value);
      })
    );
  }

  return map;
}

export async function getPublicSettings(): Promise<PublicPlatformSettings> {
  const map = await getAppSettingsMap([
    "SUPPORT_PHONE",
    "SUPPORT_TELEGRAM",
    "TELEGRAM_BOT_USERNAME",
  ]);
  return {
    supportPhone: map.get("SUPPORT_PHONE") || "",
    supportTelegram: map.get("SUPPORT_TELEGRAM") || "",
    telegramBotUsername: (map.get("TELEGRAM_BOT_USERNAME") || "").replace(/^@/, ""),
  };
}

export async function getPaymentCardSettings(): Promise<PaymentCardSettings> {
  const map = await getAppSettingsMap([
    "PAYMENT_CARD_NUMBER",
    "PAYMENT_CARD_HOLDER",
    "PAYMENT_CARD_BANK",
  ]);
  return {
    cardNumber: map.get("PAYMENT_CARD_NUMBER") || "",
    cardHolder: map.get("PAYMENT_CARD_HOLDER") || "",
    bankName: map.get("PAYMENT_CARD_BANK") || "",
  };
}
