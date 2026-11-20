import { prisma } from "@/lib/prisma";
import { formatDirection, formatUZS, languageEnumToLocale } from "@/lib/utils";
import {
  answerTelegramCallback,
  getAdminChatIds,
  notifyUserStatusChange,
  sendTelegramMessage,
} from "./bot-service";
import type { Language, OrderStatus } from "@prisma/client";

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message?: {
      chat: { id: number };
      message_id: number;
    };
    data?: string;
  };
}

const VALID_ADMIN_STATUSES = new Set<OrderStatus>([
  "WAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

  if (!update.message?.text || !update.message.from) {
    return;
  }

  const chatId = String(update.message.chat.id);
  const telegramId = BigInt(update.message.from.id);
  const text = update.message.text.trim();
  const from = update.message.from;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Handle deep-link account linking: /start link_<CODE>
  if (text.startsWith("/start link_")) {
    const code = text.replace("/start link_", "").trim();
    const userToLink = await prisma.user.findFirst({
      where: {
        telegramLinkCode: code,
        telegramLinkExpiresAt: { gt: new Date() },
      },
    });

    if (!userToLink) {
      await sendTelegramMessage(
        chatId,
        "⚠️ Bog‘lash kodi noto‘g‘ri yoki muddati tugagan. Iltimos, veb-saytdagi Profilingizdan yangi havola oling."
      );
      return;
    }

    // Disconnect previous Telegram owner if any
    await prisma.user.updateMany({
      where: { telegramId, id: { not: userToLink.id } },
      data: { telegramId: null, telegramChatId: null, telegramUsername: null },
    });

    await prisma.user.update({
      where: { id: userToLink.id },
      data: {
        telegramId,
        telegramChatId: chatId,
        telegramUsername: from.username ?? null,
        telegramLinkCode: null,
        telegramLinkExpiresAt: null,
      },
    });

    await sendTelegramMessage(
      chatId,
      `✅ <b>Muvaffaqiyatli bog‘landi!</b>\n\nHurmatli <b>${userToLink.firstName} ${userToLink.lastName}</b>, endi buyurtma holatlari va tayyor tarjima fayllarini to‘g‘ridan-to‘g‘ri shu botda qabul qilasiz.\n\nBuyurtmalaringizni ko‘rish uchun /orders buyrug‘ini yuboring.`
    );
    return;
  }

  // 2. Ensure user exists for Telegram commands
  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user && text.startsWith("/start")) {
    user = await prisma.user.create({
      data: {
        telegramId,
        telegramChatId: chatId,
        telegramUsername: from.username ?? null,
        firstName: from.first_name,
        lastName: from.last_name ?? "",
        language: "UZ",
      },
    });
  }

  // 3. /start welcome message
  if (text === "/start") {
    const greeting = [
      `👋 <b>Lingo Bridge</b> rasmiy botiga xush kelibsiz!`,
      ``,
      `Akademik (avtoreferat, dissertatsiya) va rasmiy hujjatlar tarjimasi endi yanada qulay.`,
      ``,
      `📌 <b>Buyruqlar:</b>`,
      `• /orders — Mening buyurtmalarim`,
      `• /services — Xizmatlar va narxlar`,
      `• /lang — Tilni o‘zgartirish`,
      `• /help — Yordam va aloqa`,
    ].join("\n");

    await sendTelegramMessage(chatId, greeting, {
      replyMarkup: {
        inline_keyboard: [
          [{ text: "🌐 Veb-platformada buyurtma berish", url: `${appUrl}/order` }],
          [{ text: "📋 Mening buyurtmalarim", callback_data: "cmd:orders" }],
          [
            { text: "🇺🇿 O‘zbek", callback_data: "lang:UZ" },
            { text: "🇷🇺 Русский", callback_data: "lang:RU" },
            { text: "🇬🇧 English", callback_data: "lang:EN" },
          ],
        ],
      },
    });
    return;
  }

  // 4. /orders
  if (text === "/orders") {
    await sendUserOrdersList(chatId, telegramId);
    return;
  }

  // 5. /services
  if (text === "/services") {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    const locale = languageEnumToLocale(user?.language);
    const lines = services.map((s, idx) => {
      const name = locale === "ru" ? s.nameRu : locale === "en" ? s.nameEn : s.nameUz;
      const unit = s.pricingType === "PER_PAGE" ? "/ sahifa" : "(qat’iy)";
      return `${idx + 1}. <b>${name}</b> — ${formatUZS(s.price, locale)} ${unit}`;
    });
    await sendTelegramMessage(
      chatId,
      `📚 <b>Lingo Bridge xizmatlari:</b>\n\n${lines.join("\n")}\n\n🔗 Buyurtma berish: ${appUrl}/order`
    );
    return;
  }

  // 6. /lang
  if (text === "/lang") {
    await sendTelegramMessage(chatId, "🌐 Tilni tanlang / Выберите язык / Choose language:", {
      replyMarkup: {
        inline_keyboard: [
          [
            { text: "🇺🇿 O‘zbek", callback_data: "lang:UZ" },
            { text: "🇷🇺 Русский", callback_data: "lang:RU" },
            { text: "🇬🇧 English", callback_data: "lang:EN" },
          ],
        ],
      },
    });
    return;
  }

  // 7. /help
  if (text === "/help") {
    const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+998 90 123 45 67";
    const adminLink = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "https://t.me/lingobridge_admin";
    await sendTelegramMessage(
      chatId,
      `ℹ️ <b>Lingo Bridge Yordam Markazi</b>\n\n📞 Telefon: ${phone}\n💬 Admin: ${adminLink}\n🌐 Sayt: ${appUrl}\n\nVeb-saytdagi hisobingizni botga ulash uchun saytdagi <b>Profil</b> sahifasidagi <i>"Telegram bilan bog‘lash"</i> tugmasini bosing.`
    );
  }
}

async function sendUserOrdersList(chatId: string, telegramId: bigint) {
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    await sendTelegramMessage(chatId, "Avval /start buyrug‘ini bosing yoki veb-saytdagi hisobingizni bog‘lang.");
    return;
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  if (orders.length === 0) {
    await sendTelegramMessage(chatId, "📭 Sizda hali buyurtmalar mavjud emas.");
    return;
  }

  const locale = languageEnumToLocale(user.language);
  const lines = orders.map((o) => {
    const svcName = locale === "ru" ? o.service.nameRu : locale === "en" ? o.service.nameEn : o.service.nameUz;
    return `• <b>#${o.orderNumber}</b> — ${svcName}\n   ${formatDirection(o.sourceLanguage, o.targetLanguage, locale)} | ${o.pageCount} sahifa | <b>${formatUZS(o.totalPrice, locale)}</b>\n   Holat: <code>${o.status}</code>`;
  });

  await sendTelegramMessage(
    chatId,
    `📋 <b>So‘nggi buyurtmalaringiz:</b>\n\n${lines.join("\n\n")}`
  );
}

async function handleCallbackQuery(query: NonNullable<TelegramUpdate["callback_query"]>) {
  const data = query.data || "";
  const chatId = String(query.message?.chat.id || query.from.id);
  const telegramId = BigInt(query.from.id);

  if (data === "cmd:orders") {
    await answerTelegramCallback(query.id);
    await sendUserOrdersList(chatId, telegramId);
    return;
  }

  if (data.startsWith("lang:")) {
    const lang = data.replace("lang:", "") as Language;
    if (lang === "UZ" || lang === "RU" || lang === "EN") {
      await prisma.user.updateMany({
        where: { telegramId },
        data: { language: lang },
      });
      await answerTelegramCallback(query.id, `Til saqlandi: ${lang}`);
      await sendTelegramMessage(chatId, `✅ Til yangilandi: <b>${lang}</b>`);
    }
    return;
  }

  // Admin quick order status update: ord:<orderId>:<STATUS>
  if (data.startsWith("ord:")) {
    const adminChatIds = getAdminChatIds();
    const isAdminChat = adminChatIds.includes(chatId);
    const dbAdmin = await prisma.user.findFirst({
      where: { telegramId, role: "ADMIN" },
    });

    if (!isAdminChat && !dbAdmin) {
      await answerTelegramCallback(query.id, "Faqat adminlar uchun!");
      return;
    }

    const [, orderId, nextStatusRaw] = data.split(":");
    const nextStatus = nextStatusRaw as OrderStatus;
    if (!orderId || !VALID_ADMIN_STATUSES.has(nextStatus)) {
      await answerTelegramCallback(query.id, "Noto‘g‘ri buyruq");
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      await answerTelegramCallback(query.id, "Buyurtma topilmadi");
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        completedAt: nextStatus === "COMPLETED" ? new Date() : undefined,
      },
    });

    if (nextStatus === "PAID") {
      await prisma.payment.updateMany({
        where: { orderId, status: { in: ["PENDING", "WAITING_VERIFICATION"] } },
        data: { status: "SUCCEEDED", paidAt: new Date() },
      });
    }

    // Create in-app notification for customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        type: "ORDER",
        title: `Buyurtma #${order.orderNumber} yangilandi`,
        message: `Buyurtmangiz holati ${nextStatus} ga o‘zgartirildi.`,
      },
    });

    // Audit log if admin user exists
    const auditAdmin =
      dbAdmin ?? (await prisma.user.findFirst({ where: { role: "ADMIN" } }));
    if (auditAdmin) {
      await prisma.adminAction.create({
        data: {
          adminId: auditAdmin.id,
          orderId: order.id,
          targetType: "ORDER",
          targetId: order.id,
          action: "TELEGRAM_STATUS_UPDATE",
          details: { from: order.status, to: nextStatus, telegramAdminId: String(query.from.id) },
        },
      });
    }

    await notifyUserStatusChange({
      telegramChatId: order.user.telegramChatId,
      language: order.user.language,
      orderNumber: order.orderNumber,
      status: nextStatus,
    });

    await answerTelegramCallback(query.id, `#${order.orderNumber} -> ${nextStatus}`);
    await sendTelegramMessage(
      chatId,
      `✅ Buyurtma <b>#${order.orderNumber}</b> holati <code>${nextStatus}</code> ga o‘zgartirildi.`
    );
  }
}
