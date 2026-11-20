import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  countPdfPages,
  isPdfFile,
  validateUploadedFile,
} from "@/lib/pdf";

export async function POST(request: Request) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    const validation = validateUploadedFile(
      file.name,
      file.size,
      ALLOWED_DOCUMENT_EXTENSIONS
    );
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const isPdf = isPdfFile(file.name, file.type);
    if (!isPdf) {
      return NextResponse.json({
        fileName: file.name,
        fileSize: file.size,
        isPdf: false,
        pageCount: null,
        autoDetected: false,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await countPdfPages(buffer);

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      isPdf: true,
      pageCount: result.pageCount,
      autoDetected: result.pageCount !== null,
      warning: result.error ?? null,
    });
  } catch (error) {
    console.error("[POST /api/orders/inspect-pdf]", error);
    return NextResponse.json(
      { error: "Faylni tahlil qilishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
