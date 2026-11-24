import type { Language, User } from "@prisma/client";
import { config, isPublicHttpsUrl } from "./config";
import { prisma, readStoredFile } from "./db";
import {
  escapeHtml,
  formatCompletedCaption,
  formatDirection,
  formatProfileCard,
  formatStatus,
  formatUZS,
  formatUzPhone,
  getContactRequestKeyboard,
  getMainMenuKeyboard,
  MENU_BUTTONS,
  normalizeUzPhone,
} from "./messages";
import {
  answerCallbackQuery,
  sendDocumentBuffer,
  sendDocumentByFileId,
  sendMessage,
  type TelegramCallbackQuery,
  type TelegramMessage,
  type TelegramUpdate,
} from "./telegram";

const PROFILE_TRIGGERS = new Set<string>([
  "/profile",
  "/me",
  MENU_BUTTONS.profile.UZ,
  MENU_BUTTONS.profile.RU,
  MENU_BUTTONS.profile.EN,
]);

const ORDERS_TRIGGERS = new Set<string>([
  "/orders",
  MENU_BUTTONS.orders.UZ,
  MENU_BUTTONS.orders.RU,
  MENU_BUTTONS.orders.EN,
]);

const READY_TRIGGERS = new Set<string>([
  "/ready",
  MENU_BUTTONS.ready.UZ,
  MENU_BUTTONS.ready.RU,
  MENU_BUTTONS.ready.EN,
]);

const SERVICES_TRIGGERS = new Set<string>([
  "/services",
  MENU_BUTTONS.services.UZ,
  MENU_BUTTONS.services.RU,
  MENU_BUTTONS.services.EN,
]);

const LANG_TRIGGERS = new Set<string>([
  "/lang",
  MENU_BUTTONS.lang.UZ,
  MENU_BUTTONS.lang.RU,
  MENU_BUTTONS.lang.EN,
]);

const HELP_TRIGGERS = new Set<string>([
  "/help",
  MENU_BUTTONS.help.UZ,
  MENU_BUTTONS.help.RU,
  MENU_BUTTONS.help.EN,
]);

function getLocalizedServiceName(
  service: { nameUz: string; nameRu: string; nameEn: string },
  lang: Language
): string {
  if (lang === "RU") return service.nameRu;
  if (lang === "EN") return service.nameEn;
  return service.nameUz;
}

export async function handleUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

  if (update.message) {
    await handleMessage(update.message);
  }
}

async function handleMessage(message: TelegramMessage) {
  if (!message.from) return;

  const chatId = String(message.chat.id);
  const telegramId = BigInt(message.from.id);
  const username = message.from.username ?? null;

  // 1. User shared their verified Telegram phone number via contact button
  if (message.contact) {
    await handleContactShare(message, chatId, telegramId, username);
    return;
  }

  const text = message.text?.trim();
  if (!text) return;

  // 2. Deep-link from website Profile page: /start link_<CODE>
  if (text.startsWith("/start link_")) {
    const code = text.replace("/start link_", "").trim();
    await handleDeepLinkStart(chatId, telegramId, username, code);
    return;
  }

  // Find already-linked registered user
  const user = await prisma.user.findUnique({ where: { telegramId } });

  // 3. Direct /start
  if (text === "/start" || text.startsWith("/start ")) {
    if (user && user.phone) {
      // Keep chatId & username fresh
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: chatId, telegramUsername: username },
      });
      await sendUserProfile(chatId, {
        ...user,
        telegramChatId: chatId,
        telegramUsername: username,
      });
      return;
    }

    await sendUnlinkedWelcome(chatId, message.from.first_name);
    return;
  }

  // Public commands that work even before linking
  if (SERVICES_TRIGGERS.has(text)) {
    await sendServicesList(chatId, user?.language ?? "UZ");
    return;
  }

  if (HELP_TRIGGERS.has(text)) {
    await sendHelpMessage(chatId, user?.language ?? "UZ");
    return;
  }

  // Commands below require a linked registered account
  if (!user || !user.phone) {
    await sendUnlinkedWelcome(chatId, message.from.first_name);
    return;
  }

  if (PROFILE_TRIGGERS.has(text)) {
    await sendUserProfile(chatId, user);
    return;
  }

  if (ORDERS_TRIGGERS.has(text)) {
    await sendUserOrders(chatId, user);
    return;
  }

  if (READY_TRIGGERS.has(text)) {
    await sendReadyTranslations(chatId, user);
    return;
  }

  if (LANG_TRIGGERS.has(text)) {
    await sendLanguagePicker(chatId);
    return;
  }

  // Fallback hint
  const hint =
    user.language === "RU"
      ? "Выберите нужный раздел в меню ниже 👇"
      : user.language === "EN"
        ? "Please choose an option from the menu below 👇"
        : "Quyidagi menyudan kerakli bo‘limni tanlang 👇";
  await sendMessage(chatId, hint, getMainMenuKeyboard(user.language));
}

async function handleDeepLinkStart(
  chatId: string,
  telegramId: bigint,
  username: string | null,
  code: string
) {
  const userToLink = await prisma.user.findFirst({
    where: {
      telegramLinkCode: code,
      telegramLinkExpiresAt: { gt: new Date() },
    },
  });

  if (!userToLink) {
    await sendMessage(
      chatId,
      "⚠️ Bog‘lash kodi noto‘g‘ri yoki muddati tugagan.\n\nVeb-kabinetingizdagi <b>Profil</b> bo‘limidan yangi havola oling yoki pastdagi tugma orqali telefon raqamingizni yuboring:",
      getContactRequestKeyboard("UZ")
    );
    return;
  }

  const linkedUser = await linkTelegramToUser(userToLink.id, telegramId, chatId, username);

  await sendMessage(
    chatId,
    `✅ <b>Hisobingiz muvaffaqiyatli bog‘landi!</b>`,
    getMainMenuKeyboard(linkedUser.language)
  );
  await sendUserProfile(chatId, linkedUser);
}

async function handleContactShare(
  message: TelegramMessage,
  chatId: string,
  telegramId: bigint,
  username: string | null
) {
  const contact = message.contact!;

  // Ensure the shared contact actually belongs to this Telegram user
  if (contact.user_id && message.from && contact.user_id !== message.from.id) {
    await sendMessage(
      chatId,
      "⚠️ Iltimos, boshqa birovning emas, aynan <b>o‘zingizning</b> Telegram telefon raqamingizni ulashing.",
      getContactRequestKeyboard("UZ")
    );
    return;
  }

  const normalizedPhone = normalizeUzPhone(contact.phone_number);
  if (!normalizedPhone) {
    await sendMessage(
      chatId,
      `⚠️ Telefon raqamingiz (<code>${escapeHtml(contact.phone_number)}</code>) O‘zbekiston (+998) formatida emas.\n\nAgar tizimda boshqa raqam bilan ro‘yxatdan o‘tgan bo‘lsangiz, saytdagi <b>Kabinet → Profil → Telegram bot bilan bog‘lash</b> tugmasidan foydalaning.`
    );
    return;
  }

  const registeredUser = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  if (!registeredUser) {
    const registerUrl = `${config.appUrl}/register`;
    const replyMarkup = isPublicHttpsUrl(registerUrl)
      ? {
          inline_keyboard: [[{ text: "📝 Saytda ro‘yxatdan o‘tish", url: registerUrl }]],
        }
      : undefined;

    await sendMessage(
      chatId,
      [
        `❌ <b>${escapeHtml(formatUzPhone(normalizedPhone))}</b> raqami bilan ro‘yxatdan o‘tgan foydalanuvchi topilmadi.`,
        ``,
        `Avval <b>Lingo Bridge</b> saytida shu telefon raqam bilan ro‘yxatdan o‘ting, so‘ngra botga qaytib <b>/start</b> bosing:`,
        `🌐 ${registerUrl}`,
      ].join("\n"),
      replyMarkup
    );
    return;
  }

  const linkedUser = await linkTelegramToUser(registeredUser.id, telegramId, chatId, username);

  await sendMessage(
    chatId,
    `✅ <b>Xush kelibsiz, ${escapeHtml(linkedUser.firstName)}!</b> Hisobingiz muvaffaqiyatli topildi va Telegram botga ulandi.`,
    getMainMenuKeyboard(linkedUser.language)
  );
  await sendUserProfile(chatId, linkedUser);
}

async function linkTelegramToUser(
  userId: string,
  telegramId: bigint,
  chatId: string,
  username: string | null
): Promise<User> {
  // Disconnect this telegramId from any other record (e.g. old unlinked placeholder)
  await prisma.user.updateMany({
    where: { telegramId, id: { not: userId } },
    data: { telegramId: null, telegramChatId: null, telegramUsername: null },
  });

  return prisma.user.update({
    where: { id: userId },
    data: {
      telegramId,
      telegramChatId: chatId,
      telegramUsername: username,
      telegramLinkCode: null,
      telegramLinkExpiresAt: null,
    },
  });
}

async function sendUnlinkedWelcome(chatId: string, firstName: string) {
  const text = [
    `👋 Assalomu alaykum, <b>${escapeHtml(firstName)}</b>!`,
    ``,
    `<b>Lingo Bridge</b> rasmiy Telegram botiga xush kelibsiz.`,
    ``,
    `Tizimdan ro‘yxatdan o‘tgan hisobingizdagi ma’lumotlarni ko‘rish hamda tarjimangiz tayyor bo‘lganda avtomatik xabar olish uchun pastdagi tugma orqali telefon raqamingizni yuboring 👇`,
    ``,
    `💡 <i>Yoki veb-kabinetingizdagi <b>Profil → Telegram bot bilan bog‘lash</b> tugmasini bosing:</i>`,
    `🌐 ${config.appUrl}/dashboard`,
  ].join("\n");

  await sendMessage(chatId, text, getContactRequestKeyboard("UZ"));
}

async function sendUserProfile(chatId: string, user: User) {
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    select: { status: true, totalPrice: true },
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
  const inProgressOrders = orders.filter((o) =>
    ["PENDING", "WAITING_PAYMENT", "PAID", "IN_PROGRESS"].includes(o.status)
  ).length;
  const totalSpent = orders
    .filter((o) => ["PAID", "IN_PROGRESS", "COMPLETED"].includes(o.status))
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const card = formatProfileCard({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    language: user.language,
    telegramUsername: user.telegramUsername,
    createdAt: user.createdAt,
    totalOrders,
    inProgressOrders,
    completedOrders,
    totalSpent,
  });

  await sendMessage(chatId, card, getMainMenuKeyboard(user.language));
}

async function sendUserOrders(chatId: string, user: User) {
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (orders.length === 0) {
    const emptyText =
      user.language === "RU"
        ? `📭 У вас пока нет заказов.\n\nОформить заказ: ${config.appUrl}/order`
        : user.language === "EN"
          ? `📭 You don’t have any orders yet.\n\nPlace an order: ${config.appUrl}/order`
          : `📭 Sizda hozircha buyurtmalar mavjud emas.\n\nYangi buyurtma berish: ${config.appUrl}/order`;
    await sendMessage(chatId, emptyText, getMainMenuKeyboard(user.language));
    return;
  }

  const lines = orders.map((o) => {
    const svc = escapeHtml(getLocalizedServiceName(o.service, user.language));
    const dir = formatDirection(o.sourceLanguage, o.targetLanguage, user.language);
    const price = formatUZS(o.totalPrice, user.language);
    const status = formatStatus(o.status, user.language);
    const pageUnit = user.language === "RU" ? "стр." : user.language === "EN" ? "pages" : "sahifa";
    return [
      `🔹 <b>#${escapeHtml(o.orderNumber)}</b> — ${svc}`,
      `   🌐 ${dir} | 📄 ${o.pageCount} ${pageUnit} | 💰 <b>${price}</b>`,
      `   📌 ${status}`,
    ].join("\n");
  });

  const header =
    user.language === "RU"
      ? "📋 <b>Ваши последние заказы:</b>"
      : user.language === "EN"
        ? "📋 <b>Your Recent Orders:</b>"
        : "📋 <b>So‘nggi buyurtmalaringiz:</b>";

  await sendMessage(chatId, `${header}\n\n${lines.join("\n\n")}`, getMainMenuKeyboard(user.language));
}

async function sendReadyTranslations(chatId: string, user: User) {
  const completed = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
    include: { service: true },
    orderBy: { completedAt: "desc" },
    take: 10,
  });

  if (completed.length === 0) {
    const emptyText =
      user.language === "RU"
        ? "📭 Готовых переводов пока нет. Как только перевод будет завершён, я сразу отправлю его вам сюда."
        : user.language === "EN"
          ? "📭 No completed translations yet. As soon as your translation is ready, I will send it here automatically."
          : "📭 Hozircha tayyor tarjimalar yo‘q. Tarjimangiz tugallanishi bilan shu yerga avtomatik yuboraman.";
    await sendMessage(chatId, emptyText, getMainMenuKeyboard(user.language));
    return;
  }

  const lines = completed.map((o) => {
    const svc = escapeHtml(getLocalizedServiceName(o.service, user.language));
    const fileLabel = o.translatedFileName
      ? `📄 ${escapeHtml(o.translatedFileName)}`
      : "📄 (sayt kabinetida)";
    return `✅ <b>#${escapeHtml(o.orderNumber)}</b> — ${svc}\n   ${fileLabel}`;
  });

  const downloadButtons = completed
    .filter((o) => Boolean(o.translatedFileKey) || Boolean(o.translatedTelegramFileId))
    .map((o) => [
      {
        text: `📥 #${o.orderNumber} — ${o.translatedFileName || "Faylni yuklab olish"}`,
        callback_data: `dl:${o.id}`,
      },
    ]);

  const title =
    user.language === "RU"
      ? "✅ <b>Готовые переводы:</b>"
      : user.language === "EN"
        ? "✅ <b>Ready Translations:</b>"
        : "✅ <b>Tayyor tarjimalaringiz:</b>";

  await sendMessage(
    chatId,
    `${title}\n\n${lines.join("\n\n")}`,
    downloadButtons.length > 0 ? { inline_keyboard: downloadButtons } : undefined
  );
}

async function sendServicesList(chatId: string, lang: Language) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const lines = services.map((s, idx) => {
    const name = escapeHtml(getLocalizedServiceName(s, lang));
    const unit =
      s.pricingType === "PER_PAGE"
        ? lang === "RU"
          ? "/ стр."
          : lang === "EN"
            ? "/ page"
            : "/ sahifa"
        : lang === "RU"
          ? "(фикс.)"
          : lang === "EN"
            ? "(fixed)"
            : "(qat’iy)";
    return `${idx + 1}. <b>${name}</b> — ${formatUZS(s.price, lang)} ${unit}`;
  });

  const title =
    lang === "RU"
      ? "📚 <b>Услуги и тарифы Lingo Bridge:</b>"
      : lang === "EN"
        ? "📚 <b>Lingo Bridge Services & Pricing:</b>"
        : "📚 <b>Lingo Bridge xizmatlari va narxlari:</b>";

  await sendMessage(
    chatId,
    `${title}\n\n${lines.join("\n")}\n\n🌐 ${config.appUrl}/order`
  );
}

async function sendLanguagePicker(chatId: string) {
  await sendMessage(chatId, "🌐 Tilni tanlang / Выберите язык / Choose language:", {
    inline_keyboard: [
      [
        { text: "🇺🇿 O‘zbek", callback_data: "lang:UZ" },
        { text: "🇷🇺 Русский", callback_data: "lang:RU" },
        { text: "🇬🇧 English", callback_data: "lang:EN" },
      ],
    ],
  });
}

async function sendHelpMessage(chatId: string, lang: Language) {
  const title =
    lang === "RU"
      ? "ℹ️ <b>Помощь и контакты — Lingo Bridge</b>"
      : lang === "EN"
        ? "ℹ️ <b>Support & Help — Lingo Bridge</b>"
        : "ℹ️ <b>Yordam va Aloqa — Lingo Bridge</b>";

  const text = [
    title,
    ``,
    `📞 Telefon: ${escapeHtml(config.supportPhone)}`,
    `💬 Admin: ${escapeHtml(config.supportTelegram)}`,
    `🌐 Sayt: ${config.appUrl}`,
    `🤖 Bot: @${config.botUsername}`,
  ].join("\n");

  await sendMessage(chatId, text);
}

async function handleCallbackQuery(query: TelegramCallbackQuery) {
  const data = query.data || "";
  const chatId = String(query.message?.chat.id || query.from.id);
  const telegramId = BigInt(query.from.id);

  // Language switch
  if (data.startsWith("lang:")) {
    const lang = data.replace("lang:", "") as Language;
    if (lang === "UZ" || lang === "RU" || lang === "EN") {
      await prisma.user.updateMany({
        where: { telegramId },
        data: { language: lang },
      });
      await answerCallbackQuery(query.id, `✅ ${lang}`);
      const confirmMsg =
        lang === "RU"
          ? "✅ Язык обновлён: <b>Русский</b>"
          : lang === "EN"
            ? "✅ Language updated: <b>English</b>"
            : "✅ Til yangilandi: <b>O‘zbek</b>";
      await sendMessage(chatId, confirmMsg, getMainMenuKeyboard(lang));
    }
    return;
  }

  // Download completed translation file
  if (data.startsWith("dl:")) {
    const orderId = data.replace("dl:", "");
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      await answerCallbackQuery(query.id, "Avval /start bosing", true);
      return;
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id, status: "COMPLETED" },
      include: { service: true },
    });

    if (!order) {
      await answerCallbackQuery(query.id, "Buyurtma topilmadi", true);
      return;
    }

    await answerCallbackQuery(query.id, "Fayl yuborilmoqda...");

    const caption = formatCompletedCaption({
      orderNumber: order.orderNumber,
      serviceName: getLocalizedServiceName(order.service, user.language),
      sourceLanguage: order.sourceLanguage,
      targetLanguage: order.targetLanguage,
      translatedFileName: order.translatedFileName,
      adminNote: order.adminNote,
      language: user.language,
      appUrl: config.appUrl,
    });

    // Prefer real Telegram file_id if cached
    if (
      order.translatedTelegramFileId &&
      !order.translatedTelegramFileId.startsWith("NOTIFIED_")
    ) {
      const res = await sendDocumentByFileId({
        chatId,
        fileId: order.translatedTelegramFileId,
        caption,
      });
      if (res.ok) return;
    }

    // Fallback: read directly from local storage
    if (order.translatedFileKey) {
      const buffer = await readStoredFile(order.translatedFileKey);
      if (buffer) {
        const res = await sendDocumentBuffer({
          chatId,
          buffer,
          fileName: order.translatedFileName || `translation_${order.orderNumber}.pdf`,
          caption,
        });
        const newFileId = res.result?.document?.file_id;
        if (newFileId) {
          await prisma.order.update({
            where: { id: order.id },
            data: { translatedTelegramFileId: newFileId },
          });
        }
        return;
      }
    }

    await sendMessage(
      chatId,
      `⚠️ Faylni server xotirasidan topib bo‘lmadi. Shaxsiy kabinetdan yuklab oling:\n${config.appUrl}/dashboard`
    );
  }
}
