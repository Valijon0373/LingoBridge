import type { Language, OrderStatus, Role } from "@prisma/client";

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Normalizes Uzbekistan phone numbers into "+998XXXXXXXXX" format
 * matching Lingo Bridge web registration.
 */
export function normalizeUzPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return null;
}

export function formatUzPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const normalized = normalizeUzPhone(phone);
  if (!normalized) return phone;
  const d = normalized.slice(1); // 998XXXXXXXXX
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

export function formatUZS(amount: number, lang: Language): string {
  const formatted = new Intl.NumberFormat("uz-UZ").format(amount).replace(/,/g, " ");
  if (lang === "RU") return `${formatted} сум`;
  if (lang === "EN") return `${formatted} UZS`;
  return `${formatted} so‘m`;
}

const LANG_NAMES: Record<Language, Record<Language, string>> = {
  UZ: { UZ: "O‘zbek", RU: "Rus", EN: "Ingliz" },
  RU: { UZ: "Узбекский", RU: "Русский", EN: "Английский" },
  EN: { UZ: "Uzbek", RU: "Russian", EN: "English" },
};

export function formatDirection(src: Language, dst: Language, uiLang: Language): string {
  return `${LANG_NAMES[uiLang][src]} → ${LANG_NAMES[uiLang][dst]}`;
}

export function formatLanguageLabel(lang: Language): string {
  if (lang === "RU") return "🇷🇺 Русский";
  if (lang === "EN") return "🇬🇧 English";
  return "🇺🇿 O‘zbek";
}

const STATUS_LABELS: Record<Language, Record<OrderStatus, string>> = {
  UZ: {
    PENDING: "⏳ Kutilmoqda",
    WAITING_PAYMENT: "💳 To‘lov kutilmoqda",
    PAID: "💰 To‘langan",
    IN_PROGRESS: "✍️ Tarjima jarayonida",
    COMPLETED: "✅ Tayyor",
    CANCELLED: "❌ Bekor qilingan",
    REFUNDED: "↩️ Qaytarilgan",
  },
  RU: {
    PENDING: "⏳ Ожидает",
    WAITING_PAYMENT: "💳 Ожидает оплаты",
    PAID: "💰 Оплачен",
    IN_PROGRESS: "✍️ В работе",
    COMPLETED: "✅ Готов",
    CANCELLED: "❌ Отменён",
    REFUNDED: "↩️ Возврат",
  },
  EN: {
    PENDING: "⏳ Pending",
    WAITING_PAYMENT: "💳 Awaiting Payment",
    PAID: "💰 Paid",
    IN_PROGRESS: "✍️ In Progress",
    COMPLETED: "✅ Completed",
    CANCELLED: "❌ Cancelled",
    REFUNDED: "↩️ Refunded",
  },
};

export function formatStatus(status: OrderStatus, lang: Language): string {
  return STATUS_LABELS[lang][status];
}

export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

export const MENU_BUTTONS = {
  profile: {
    UZ: "👤 Mening ma’lumotlarim",
    RU: "👤 Мои данные",
    EN: "👤 My Profile",
  },
  orders: {
    UZ: "📋 Mening buyurtmalarim",
    RU: "📋 Мои заказы",
    EN: "📋 My Orders",
  },
  ready: {
    UZ: "✅ Tayyor tarjimalar",
    RU: "✅ Готовые переводы",
    EN: "✅ Ready Translations",
  },
  services: {
    UZ: "📚 Xizmatlar",
    RU: "📚 Услуги",
    EN: "📚 Services",
  },
  lang: {
    UZ: "🌐 Til",
    RU: "🌐 Язык",
    EN: "🌐 Language",
  },
  help: {
    UZ: "ℹ️ Yordam",
    RU: "ℹ️ Помощь",
    EN: "ℹ️ Help",
  },
  sharePhone: {
    UZ: "📱 Telefon raqamni ulashish",
    RU: "📱 Поделиться номером телефона",
    EN: "📱 Share Phone Number",
  },
} as const;

export function getMainMenuKeyboard(lang: Language) {
  return {
    keyboard: [
      [{ text: MENU_BUTTONS.profile[lang] }, { text: MENU_BUTTONS.orders[lang] }],
      [{ text: MENU_BUTTONS.ready[lang] }, { text: MENU_BUTTONS.services[lang] }],
      [{ text: MENU_BUTTONS.lang[lang] }, { text: MENU_BUTTONS.help[lang] }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export function getContactRequestKeyboard(lang: Language = "UZ") {
  return {
    keyboard: [
      [
        {
          text: MENU_BUTTONS.sharePhone[lang],
          request_contact: true,
        },
      ],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function formatProfileCard(params: {
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  language: Language;
  telegramUsername: string | null;
  createdAt: Date;
  totalOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalSpent: number;
}): string {
  const fullName = escapeHtml(`${params.firstName} ${params.lastName}`.trim());
  const phone = escapeHtml(formatUzPhone(params.phone));
  const tgUser = params.telegramUsername ? `@${escapeHtml(params.telegramUsername)}` : "—";
  const dateStr = formatDate(params.createdAt);
  const spent = formatUZS(params.totalSpent, params.language);

  if (params.language === "RU") {
    return [
      `👤 <b>Ваш профиль — Lingo Bridge</b>`,
      ``,
      `• <b>Имя и фамилия:</b> ${fullName}`,
      `• <b>Телефон:</b> <code>${phone}</code>`,
      `• <b>Telegram:</b> ${tgUser}`,
      `• <b>Роль:</b> ${params.role === "ADMIN" ? "Администратор" : "Пользователь"}`,
      `• <b>Язык интерфейса:</b> ${formatLanguageLabel(params.language)}`,
      `• <b>Дата регистрации:</b> ${dateStr}`,
      ``,
      `📊 <b>Статистика заказов:</b>`,
      `• Всего заказов: <b>${params.totalOrders}</b>`,
      `• В процессе: <b>${params.inProgressOrders}</b>`,
      `• Готовых переводов: <b>${params.completedOrders}</b>`,
      `• Оплачено всего: <b>${spent}</b>`,
      ``,
      `🔔 Как только перевод будет готов, вы сразу получите уведомление и файл здесь.`,
    ].join("\n");
  }

  if (params.language === "EN") {
    return [
      `👤 <b>Your Profile — Lingo Bridge</b>`,
      ``,
      `• <b>Full Name:</b> ${fullName}`,
      `• <b>Phone:</b> <code>${phone}</code>`,
      `• <b>Telegram:</b> ${tgUser}`,
      `• <b>Role:</b> ${params.role === "ADMIN" ? "Administrator" : "Client"}`,
      `• <b>Language:</b> ${formatLanguageLabel(params.language)}`,
      `• <b>Member Since:</b> ${dateStr}`,
      ``,
      `📊 <b>Order Statistics:</b>`,
      `• Total Orders: <b>${params.totalOrders}</b>`,
      `• Active / In Progress: <b>${params.inProgressOrders}</b>`,
      `• Completed Translations: <b>${params.completedOrders}</b>`,
      `• Total Spent: <b>${spent}</b>`,
      ``,
      `🔔 Whenever your translation is ready, you will automatically receive a notification and file here.`,
    ].join("\n");
  }

  return [
    `👤 <b>Sizning ma’lumotlaringiz — Lingo Bridge</b>`,
    ``,
    `• <b>F.I.Sh:</b> ${fullName}`,
    `• <b>Telefon raqam:</b> <code>${phone}</code>`,
    `• <b>Telegram:</b> ${tgUser}`,
    `• <b>Rol:</b> ${params.role === "ADMIN" ? "Administrator" : "Foydalanuvchi"}`,
    `• <b>Interfeys tili:</b> ${formatLanguageLabel(params.language)}`,
    `• <b>Ro‘yxatdan o‘tgan sana:</b> ${dateStr}`,
    ``,
    `📊 <b>Buyurtmalar statistikasi:</b>`,
    `• Jami buyurtmalar: <b>${params.totalOrders}</b>`,
    `• Jarayondagi buyurtmalar: <b>${params.inProgressOrders}</b>`,
    `• Tayyor tarjimalar: <b>${params.completedOrders}</b>`,
    `• Jami to‘langan summa: <b>${spent}</b>`,
    ``,
    `🔔 Tizimda tarjimangiz tayyor bo‘lishi bilan sizga shu yerda avtomatik xabar va tayyor fayl yuboriladi.`,
  ].join("\n");
}

export function formatCompletedCaption(params: {
  orderNumber: string;
  serviceName: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  translatedFileName: string | null;
  adminNote: string | null;
  language: Language;
  appUrl: string;
}): string {
  const dir = formatDirection(params.sourceLanguage, params.targetLanguage, params.language);
  const note = params.adminNote ? `\n💬 <i>${escapeHtml(params.adminNote)}</i>` : "";

  if (params.language === "RU") {
    return [
      `✅ <b>Ваш перевод готов — #${escapeHtml(params.orderNumber)}!</b>`,
      ``,
      `📚 <b>Услуга:</b> ${escapeHtml(params.serviceName)}`,
      `🌐 <b>Направление:</b> ${escapeHtml(dir)}`,
      params.translatedFileName ? `📄 <b>Файл:</b> ${escapeHtml(params.translatedFileName)}` : "",
      note,
      ``,
      `🔗 Личный кабинет: ${params.appUrl}/dashboard`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (params.language === "EN") {
    return [
      `✅ <b>Your translation is ready — #${escapeHtml(params.orderNumber)}!</b>`,
      ``,
      `📚 <b>Service:</b> ${escapeHtml(params.serviceName)}`,
      `🌐 <b>Direction:</b> ${escapeHtml(dir)}`,
      params.translatedFileName ? `📄 <b>File:</b> ${escapeHtml(params.translatedFileName)}` : "",
      note,
      ``,
      `🔗 Dashboard: ${params.appUrl}/dashboard`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `✅ <b>Tarjimangiz tayyor — #${escapeHtml(params.orderNumber)}!</b>`,
    ``,
    `📚 <b>Xizmat:</b> ${escapeHtml(params.serviceName)}`,
    `🌐 <b>Yo‘nalish:</b> ${escapeHtml(dir)}`,
    params.translatedFileName ? `📄 <b>Fayl:</b> ${escapeHtml(params.translatedFileName)}` : "",
    note,
    ``,
    `🔗 Shaxsiy kabinet: ${params.appUrl}/dashboard`,
  ]
    .filter(Boolean)
    .join("\n");
}
