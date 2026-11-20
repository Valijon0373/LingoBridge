/**
 * Local development Telegram Bot polling runner.
 * Run with: npm run bot:dev
 * In production, prefer setting the webhook to POST /api/telegram/webhook.
 */
import { handleTelegramUpdate, type TelegramUpdate } from "../lib/telegram/handlers";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set in environment (.env).");
  console.error("   Add TELEGRAM_BOT_TOKEN to .env and re-run `npm run bot:dev`.");
  process.exit(1);
}

let offset = 0;

async function poll() {
  console.log("🤖 Lingo Bridge Telegram Bot polling started...");

  // Remove webhook if any so getUpdates works cleanly in dev
  await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: "POST" });

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?timeout=30&offset=${offset}`
      );
      const data = (await res.json()) as {
        ok: boolean;
        result?: TelegramUpdate[];
        description?: string;
      };

      if (!data.ok) {
        console.error("[Bot Polling Error]:", data.description);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      for (const update of data.result ?? []) {
        offset = update.update_id + 1;
        try {
          await handleTelegramUpdate(update);
        } catch (err) {
          console.error("[Bot Update Handler Error]:", err);
        }
      }
    } catch (err) {
      console.error("[Bot Network Error]:", err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

poll();
