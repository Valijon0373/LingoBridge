const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || "";

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN .env faylida ko‘rsatilmagan!");
  process.exit(1);
}

export const config = {
  botToken: token,
  botUsername: (process.env.TELEGRAM_BOT_USERNAME || "lingo_bridge_spin_bot").replace(/^@/, ""),
  appUrl: (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, ""),
  pollNotificationsMs: Math.max(2000, Number(process.env.POLL_NOTIFICATIONS_MS || "5000")),
  supportPhone: process.env.SUPPORT_PHONE || "+998 90 123 45 67",
  supportTelegram: process.env.SUPPORT_TELEGRAM || "https://t.me/lingobridge_admin",
};

/**
 * Telegram forbids http://localhost URLs inside inline_keyboard `url` buttons.
 * Only attach inline URL buttons when APP_URL is a public HTTPS URL.
 */
export function isPublicHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname !== "localhost" &&
      parsed.hostname !== "127.0.0.1"
    );
  } catch {
    return false;
  }
}
