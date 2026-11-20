import { PDFDocument } from "pdf-lib";

export const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
]);

export const ALLOWED_RECEIPT_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

export const ALLOWED_TRANSLATION_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".rtf",
  ".txt",
  ".zip",
]);

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1) return "";
  return fileName.slice(idx).toLowerCase();
}

export function isPdfFile(fileName: string, mimeType?: string): boolean {
  return getFileExtension(fileName) === ".pdf" || mimeType === "application/pdf";
}

export function validateUploadedFile(
  fileName: string,
  fileSize: number,
  allowedExtensions: Set<string>
): { valid: boolean; error?: string } {
  const ext = getFileExtension(fileName);
  if (!allowedExtensions.has(ext)) {
    return {
      valid: false,
      error: `Ruxsat etilmagan fayl formati (${ext || "noma'lum"}). Ruxsat etilganlar: ${Array.from(allowedExtensions).join(", ").toUpperCase()}`,
    };
  }
  if (fileSize <= 0) {
    return { valid: false, error: "Fayl bo‘sh bo‘lishi mumkin emas" };
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "Fayl hajmi 25 MB dan oshmasligi kerak" };
  }
  return { valid: true };
}

/**
 * Counts pages in a PDF buffer safely on the server using pdf-lib.
 * Uses ignoreEncryption so password-protected PDFs with standard owner permissions
 * still return accurate page counts instead of failing.
 */
export async function countPdfPages(buffer: Buffer): Promise<{
  pageCount: number | null;
  error?: string;
}> {
  try {
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
    const count = pdfDoc.getPageCount();
    if (count > 0) {
      return { pageCount: count };
    }
    return { pageCount: null, error: "PDF sahifalari aniqlanmadi" };
  } catch (err) {
    console.error("[PDF] Failed to inspect PDF page count:", err);
    return {
      pageCount: null,
      error: "PDF faylni o‘qib bo‘lmadi. Iltimos, sahifalar sonini qo‘lda kiriting.",
    };
  }
}
