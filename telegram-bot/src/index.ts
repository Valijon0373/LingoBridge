import { config } from "./config";
import { prisma } from "./db";
import { handleUpdate } from "./handlers";
import { deleteWebhook, getMe, getUpdates, setMyCommands } from "./telegram";
import { startTranslationWatcher } from "./watcher";

let running = true;
let offset = 0;

async function main() {
  console.log("🚀 Lingo Bridge Telegram Bot ishga tushmoqda...");

  const me = await getMe();
  if (!me.ok || !me.result) {
    console.error("❌ Bot tokeni noto‘g‘ri yoki Telegram API bilan aloqa yo‘q:", me.description);
    process.exit(1);
  }

  console.log(`✅ Bot ulandi: @${me.result.username} (${me.result.first_name})`);

  // Ensure long polling works cleanly
  await deleteWebhook();

  // Register bot menu commands
  await setMyCommands([
    { command: "start", description: "Botni ishga tushirish / Hisobni bog‘lash" },
    { command: "profile", description: "Mening ma’lumotlarim va statistikam" },
    { command: "orders", description: "Mening buyurtmalarim" },
    { command: "ready", description: "Tayyor tarjimalarni yuklab olish" },
    { command: "services", description: "Xizmatlar va narxlar" },
    { command: "lang", description: "Interfeys tilini o‘zgartirish" },
    { command: "help", description: "Yordam va aloqa" },
  ]);

  const stopWatcher = startTranslationWatcher();

  const shutdown = async (signal: string) => {
    if (!running) return;
    console.log(`\n🛑 ${signal} qabul qilindi. Bot to‘xtatilmoqda...`);
    running = false;
    stopWatcher();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  console.log(`🤖 @${config.botUsername} xabarlarni kutmoqda...`);

  while (running) {
    const res = await getUpdates(offset, 30);

    if (!res.ok) {
      if (running) {
        console.error("[Polling Error]:", res.description);
        await new Promise((r) => setTimeout(r, 3000));
      }
      continue;
    }

    for (const update of res.result ?? []) {
      offset = update.update_id + 1;
      try {
        await handleUpdate(update);
      } catch (err) {
        console.error("[Update Handler Error]:", err);
      }
    }
  }
}

main().catch(async (err) => {
  console.error("[Fatal Bot Error]:", err);
  await prisma.$disconnect();
  process.exit(1);
});
