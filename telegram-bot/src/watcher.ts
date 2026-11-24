import { config } from "./config";
import { prisma, readStoredFile } from "./db";
import { formatCompletedCaption } from "./messages";
import { sendDocumentBuffer, sendMessage } from "./telegram";

/**
 * Watches PostgreSQL for orders that become COMPLETED while the bot is running
 * and guarantees the customer receives a Telegram notification + file.
 *
 * Uses a 4-second grace window after `completedAt` so if the Next.js web app
 * already delivered the file and populated `translatedTelegramFileId`, this
 * watcher skips it with zero duplicate messages.
 */
export function startTranslationWatcher(): () => void {
  const startedAt = new Date();
  let isChecking = false;

  const checkCompletedOrders = async () => {
    if (isChecking) return;
    isChecking = true;

    try {
      const graceCutoff = new Date(Date.now() - 4000);

      const pendingNotifications = await prisma.order.findMany({
        where: {
          status: "COMPLETED",
          translatedTelegramFileId: null,
          completedAt: {
            gte: startedAt,
            lte: graceCutoff,
          },
          user: {
            telegramChatId: { not: null },
          },
        },
        include: {
          user: true,
          service: true,
        },
        take: 20,
      });

      for (const order of pendingNotifications) {
        const chatId = order.user.telegramChatId;
        if (!chatId) continue;

        const lang = order.user.language;
        const serviceName =
          lang === "RU"
            ? order.service.nameRu
            : lang === "EN"
              ? order.service.nameEn
              : order.service.nameUz;

        const caption = formatCompletedCaption({
          orderNumber: order.orderNumber,
          serviceName,
          sourceLanguage: order.sourceLanguage,
          targetLanguage: order.targetLanguage,
          translatedFileName: order.translatedFileName,
          adminNote: order.adminNote,
          language: lang,
          appUrl: config.appUrl,
        });

        let deliveredMarker: string | null = null;

        if (order.translatedFileKey) {
          const buffer = await readStoredFile(order.translatedFileKey);
          if (buffer) {
            const docRes = await sendDocumentBuffer({
              chatId,
              buffer,
              fileName: order.translatedFileName || `translation_${order.orderNumber}.pdf`,
              caption,
            });
            if (docRes.ok) {
              deliveredMarker =
                docRes.result?.document?.file_id || `NOTIFIED_${Date.now()}`;
            }
          }
        }

        if (!deliveredMarker) {
          const msgRes = await sendMessage(chatId, caption);
          if (msgRes.ok) {
            deliveredMarker = `NOTIFIED_${msgRes.result?.message_id ?? Date.now()}`;
          }
        }

        if (deliveredMarker) {
          await prisma.order.update({
            where: { id: order.id },
            data: { translatedTelegramFileId: deliveredMarker },
          });
          console.log(
            `📨 Tayyor tarjima xabari yuborildi: #${order.orderNumber} -> chat ${chatId}`
          );
        }
      }
    } catch (error) {
      console.error("[Translation Watcher Error]:", error);
    } finally {
      isChecking = false;
    }
  };

  const timer = setInterval(checkCompletedOrders, config.pollNotificationsMs);
  console.log(
    `🔔 Tayyor tarjimalar kuzatuvchisi ishga tushdi (har ${config.pollNotificationsMs / 1000} soniyada)`
  );

  return () => clearInterval(timer);
}
