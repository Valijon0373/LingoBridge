import { NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/handlers";

export async function POST(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (incomingSecret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/telegram/webhook]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
