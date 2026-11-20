import { NextResponse } from "next/server";
import path from "path";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string[] }> }
) {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) return errorResponse!;

  const { key: keySegments } = await context.params;
  const key = keySegments.map(decodeURIComponent).join("/");

  // Verify access rights unless user is ADMIN
  if (user.role !== "ADMIN") {
    const ownedOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        OR: [
          { originalFileKey: key },
          { translatedFileKey: key },
          { payments: { some: { receiptFileKey: key } } },
        ],
      },
      select: { id: true },
    });

    if (!ownedOrder) {
      return NextResponse.json({ error: "Ushbu faylga kirish huquqi yo‘q" }, { status: 403 });
    }
  }

  const storage = getStorageProvider();
  const fileData = await storage.read(key);

  if (!fileData) {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 404 });
  }

  const url = new URL(request.url);
  const inline = url.searchParams.get("inline") === "1";
  const downloadName = path.basename(key).replace(/^[a-f0-9]{16}_/, "");

  return new NextResponse(new Uint8Array(fileData.buffer), {
    status: 200,
    headers: {
      "Content-Type": fileData.mimeType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
