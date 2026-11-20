import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getTelegramBotUsername } from "@/lib/telegram/bot-service";

export async function POST() {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const code = crypto.randomBytes(12).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramLinkCode: code,
      telegramLinkExpiresAt: expiresAt,
    },
  });

  const botUsername = getTelegramBotUsername();
  const deepLink = `https://t.me/${botUsername}?start=link_${code}`;

  return NextResponse.json({
    code,
    deepLink,
    botUsername,
    expiresAt: expiresAt.toISOString(),
  });
}
