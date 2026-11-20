import { formatDirection, formatUZS, formatUzPhone, languageEnumToLocale } from "@/lib/utils";
import type { Language, OrderStatus } from "@prisma/client";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

export function getAdminChatIds(): string[] {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_IDS || "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function getTelegramBotUsername(): string {
  return (
    process.env.TELEGRAM_BOT_USERNAME ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
    "lingobridge_bot"
  ).replace(/^@/, "");
}

async function callTelegramApi<T = unknown>(
  method: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log(`[Telegram Bot Mock] ${method}:`, JSON.stringify(body).slice(0, 300));
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok: boolean; result?: T; description?: string };
    if (!data.ok) {
      console.error(`[Telegram API Error] ${method}:`, data.description);
    }
    return data;
  } catch (error) {
    console.error(`[Telegram API Network Error] ${method}:`, error);
    return { ok: false, description: String(error) };
  }
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: {
    parseMode?: "HTML" | "MarkdownV2";
    replyMarkup?: Record<string, unknown>;
  }
) {
  return callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode ?? "HTML",
    reply_markup: options?.replyMarkup,
  });
}

export async function answerTelegramCallback(callbackQueryId: string, text?: string) {
  return callTelegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

export async function sendTelegramDocumentBuffer(params: {
  chatId: string | number;
  buffer: Buffer;
  fileName: string;
  caption?: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log(`[Telegram Bot Mock] sendDocument to ${params.chatId}: ${params.fileName}`);
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  try {
    const form = new FormData();
    form.append("chat_id", String(params.chatId));
    if (params.caption) {
      form.append("caption", params.caption);
      form.append("parse_mode", "HTML");
    }
    const blob = new Blob([new Uint8Array(params.buffer)]);
    form.append("document", blob, params.fileName);

    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendDocument`, {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { ok: boolean; result?: { document?: { file_id?: string } }; description?: string };
    return data;
  } catch (error) {
    console.error("[Telegram sendDocument Error]:", error);
    return { ok: false, description: String(error) };
  }
}

export async function getTelegramBotInfo() {
  if (!isTelegramConfigured()) {
    return {
      configured: false,
      username: getTelegramBotUsername(),
      adminChatCount: getAdminChatIds().length,
    };
  }

  const me = await callTelegramApi<{ id: number; username: string; first_name: string }>(
    "getMe",
    {}
  );
  const webhook = await callTelegramApi<{ url: string; pending_update_count: number }>(
    "getWebhookInfo",
    {}
  );

  return {
    configured: true,
    ok: me.ok,
    bot: me.result ?? null,
    username: me.result?.username ?? getTelegramBotUsername(),
    webhookUrl: webhook.result?.url || "",
    pendingUpdates: webhook.result?.pending_update_count ?? 0,
    adminChatCount: getAdminChatIds().length,
  };
}

export async function setTelegramWebhook(url: string) {
  return callTelegramApi("setWebhook", {
    url,
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
    allowed_updates: ["message", "callback_query"],
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function notifyAdminsNewOrder(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string | null;
  serviceName: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  pageCount: number;
  totalPrice: number;
  fileName: string;
}) {
  const adminIds = getAdminChatIds();
  if (adminIds.length === 0) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const text = [
    `🆕 <b>Yangi buyurtma #${escapeHtml(order.orderNumber)}</b>`,
    ``,
    `👤 <b>Mijoz:</b> ${escapeHtml(order.customerName)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(formatUzPhone(order.phone))}`,
    `📚 <b>Xizmat:</b> ${escapeHtml(order.serviceName)}`,
    `🌐 <b>Yo‘nalish:</b> ${escapeHtml(formatDirection(order.sourceLanguage, order.targetLanguage, "uz"))}`,
    `📄 <b>Fayl:</b> ${escapeHtml(order.fileName)} (${order.pageCount} sahifa)`,
    `💰 <b>Jami summa:</b> ${escapeHtml(formatUZS(order.totalPrice, "uz"))}`,
    ``,
    `🔗 <a href="${appUrl}/admin">Admin panelda ochish</a>`,
  ].join("\n");

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "✅ To‘langan (PAID)", callback_data: `ord:${order.id}:PAID` },
        { text: "⏳ Jarayonda", callback_data: `ord:${order.id}:IN_PROGRESS` },
      ],
      [{ text: "❌ Bekor qilish", callback_data: `ord:${order.id}:CANCELLED` }],
    ],
  };

  await Promise.allSettled(
    adminIds.map((chatId) => sendTelegramMessage(chatId, text, { replyMarkup }))
  );
}

export async function notifyAdminsReceiptUploaded(params: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string | null;
  totalPrice: number;
  receiptFileName: string;
  receiptBuffer?: Buffer;
}) {
  const adminIds = getAdminChatIds();
  if (adminIds.length === 0) return;

  const caption = [
    `🧾 <b>To‘lov cheki yuklandi — #${escapeHtml(params.orderNumber)}</b>`,
    `👤 Mijoz: ${escapeHtml(params.customerName)} (${escapeHtml(formatUzPhone(params.phone))})`,
    `💰 Summa: <b>${escapeHtml(formatUZS(params.totalPrice, "uz"))}</b>`,
    `📌 Holat: <code>IN_PROGRESS</code> (tekshirish kutilmoqda)`,
  ].join("\n");

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "✅ Chek to‘g‘ri (PAID)", callback_data: `ord:${params.orderId}:PAID` },
        { text: "⏳ Jarayonda qoldirish", callback_data: `ord:${params.orderId}:IN_PROGRESS` },
      ],
      [{ text: "❌ Rad etish (WAITING_PAYMENT)", callback_data: `ord:${params.orderId}:WAITING_PAYMENT` }],
    ],
  };

  await Promise.allSettled(
    adminIds.map(async (chatId) => {
      if (params.receiptBuffer) {
        await sendTelegramDocumentBuffer({
          chatId,
          buffer: params.receiptBuffer,
          fileName: params.receiptFileName,
          caption,
        });
      }
      await sendTelegramMessage(
        chatId,
        `Buyurtma <b>#${escapeHtml(params.orderNumber)}</b> bo‘yicha tez harakat:`,
        { replyMarkup }
      );
    })
  );
}

const STATUS_MESSAGES: Record<
  "uz" | "ru" | "en",
  Record<OrderStatus, string>
> = {
  uz: {
    PENDING: "Kutilmoqda",
    WAITING_PAYMENT: "To‘lov kutilmoqda",
    PAID: "To‘langan",
    IN_PROGRESS: "Jarayonda",
    COMPLETED: "Tugallangan",
    CANCELLED: "Bekor qilingan",
    REFUNDED: "Qaytarilgan",
  },
  ru: {
    PENDING: "Ожидает",
    WAITING_PAYMENT: "Ожидает оплаты",
    PAID: "Оплачен",
    IN_PROGRESS: "В работе",
    COMPLETED: "Завершён",
    CANCELLED: "Отменён",
    REFUNDED: "Возврат",
  },
  en: {
    PENDING: "Pending",
    WAITING_PAYMENT: "Waiting Payment",
    PAID: "Paid",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  },
};

export async function notifyUserStatusChange(params: {
  telegramChatId: string | null | undefined;
  language: Language;
  orderNumber: string;
  status: OrderStatus;
  adminNote?: string | null;
}) {
  if (!params.telegramChatId) return;
  const locale = languageEnumToLocale(params.language);
  const statusLabel = STATUS_MESSAGES[locale][params.status];

  const templates = {
    uz: `🔔 <b>Lingo Bridge</b>\n\nBuyurtmangiz <b>#${escapeHtml(params.orderNumber)}</b> holati yangilandi:\n📌 Yangi holat: <b>${statusLabel}</b>`,
    ru: `🔔 <b>Lingo Bridge</b>\n\nСтатус вашего заказа <b>#${escapeHtml(params.orderNumber)}</b> обновлён:\n📌 Новый статус: <b>${statusLabel}</b>`,
    en: `🔔 <b>Lingo Bridge</b>\n\nYour order <b>#${escapeHtml(params.orderNumber)}</b> status has been updated:\n📌 New status: <b>${statusLabel}</b>`,
  };

  let text = templates[locale];
  if (params.adminNote) {
    text += `\n💬 ${escapeHtml(params.adminNote)}`;
  }

  await sendTelegramMessage(params.telegramChatId, text);
}

export async function notifyUserOrderCompleted(params: {
  telegramChatId: string | null | undefined;
  language: Language;
  orderNumber: string;
  translatedFileName: string;
  translatedBuffer?: Buffer;
}): Promise<string | null> {
  if (!params.telegramChatId) return null;
  const locale = languageEnumToLocale(params.language);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const captions = {
    uz: `✅ <b>Buyurtmangiz tayyor — #${escapeHtml(params.orderNumber)}!</b>\n\nTayyor tarjima fayli ilova qilindi. Shuningdek, shaxsiy kabinetingizdan ham yuklab olishingiz mumkin:\n${appUrl}/dashboard`,
    ru: `✅ <b>Ваш заказ готов — #${escapeHtml(params.orderNumber)}!</b>\n\nГотовый перевод прикреплён ниже. Вы также можете скачать его в личном кабинете:\n${appUrl}/dashboard`,
    en: `✅ <b>Your order is ready — #${escapeHtml(params.orderNumber)}!</b>\n\nYour translated document is attached. You can also download it anytime from your dashboard:\n${appUrl}/dashboard`,
  };

  if (params.translatedBuffer) {
    const res = await sendTelegramDocumentBuffer({
      chatId: params.telegramChatId,
      buffer: params.translatedBuffer,
      fileName: params.translatedFileName,
      caption: captions[locale],
    });
    return res.result?.document?.file_id ?? null;
  }

  await sendTelegramMessage(params.telegramChatId, captions[locale]);
  return null;
}

export async function broadcastToTelegramUsers(params: {
  chatIds: string[];
  title: string;
  message: string;
}): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  const text = `📢 <b>${escapeHtml(params.title)}</b>\n\n${escapeHtml(params.message)}`;

  for (const chatId of params.chatIds) {
    const res = await sendTelegramMessage(chatId, text);
    if (res.ok) sent++;
    else failed++;
  }

  return { sent, failed };
}
