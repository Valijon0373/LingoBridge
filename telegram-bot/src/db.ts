import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function readStoredFile(key: string): Promise<Buffer | null> {
  try {
    const record = await prisma.storedFile.findUnique({
      where: { key },
      select: { data: true },
    });
    if (!record) return null;
    return Buffer.from(record.data);
  } catch {
    return null;
  }
}
