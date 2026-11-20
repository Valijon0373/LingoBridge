import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTelegramBotInfo, setTelegramWebhook } from "@/lib/telegram/bot-service";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const info = await getTelegramBotInfo();
  return NextResponse.json({ telegram: info });
}

export async function POST(request: Request) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  try {
    const body = (await request.json()) as { webhookUrl?: string };
    const defaultUrl = `${(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")}/api/telegram/webhook`;
    const targetUrl = (body.webhookUrl || defaultUrl).trim();

    if (!targetUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Telegram webhook manzili HTTPS (https://...) bo‘lishi shart" },
        { status: 400 }
      );
    }

    const res = await setTelegramWebhook(targetUrl);

    await logAdminAction({
      adminId: admin.id,
      targetType: "TELEGRAM",
      action: "SET_WEBHOOK",
      details: { targetUrl, ok: res.ok },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: res.description || "Webhook o‘rnatishda xatolik" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, webhookUrl: targetUrl });
  } catch (error) {
    console.error("[POST /api/admin/telegram]", error);
    return NextResponse.json({ error: "Webhook o‘rnatib bo‘lmadi" }, { status: 500 });
  }
}
