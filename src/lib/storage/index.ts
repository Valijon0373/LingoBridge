import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";

export type StorageFolder = "originals" | "receipts" | "translations";

export interface StoredFileResult {
  key: string;
  fileName: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  upload(params: {
    folder: StorageFolder;
    originalName: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileResult>;
  read(key: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
  delete(key: string): Promise<void>;
}

function sanitizeFileName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, ext)
    .replace(/[^a-zA-Z0-9_\-\u0400-\u04FF]/g, "_")
    .slice(0, 60);
  return `${base || "document"}${ext}`;
}

function buildStorageKey(folder: StorageFolder, originalName: string): string {
  const safeName = sanitizeFileName(originalName);
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const datePrefix = new Date().toISOString().slice(0, 10);
  return `${folder}/${datePrefix}/${uniqueId}_${safeName}`;
}

function guessMimeType(key: string): string {
  const ext = path.extname(key).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".txt": "text/plain",
    ".rtf": "application/rtf",
    ".zip": "application/zip",
  };
  return map[ext] ?? "application/octet-stream";
}

class DatabaseStorageProvider implements StorageProvider {
  async upload({
    folder,
    originalName,
    buffer,
    mimeType,
  }: {
    folder: StorageFolder;
    originalName: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileResult> {
    const key = buildStorageKey(folder, originalName);
    const resolvedMime = mimeType || guessMimeType(originalName);

    await prisma.storedFile.create({
      data: {
        key,
        fileName: originalName,
        mimeType: resolvedMime,
        size: buffer.length,
        data: new Uint8Array(buffer),
      },
    });

    return {
      key,
      fileName: originalName,
      size: buffer.length,
      mimeType: resolvedMime,
    };
  }

  async read(key: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      const record = await prisma.storedFile.findUnique({
        where: { key },
        select: { data: true, mimeType: true },
      });
      if (!record) return null;
      return {
        buffer: Buffer.from(record.data),
        mimeType: record.mimeType || guessMimeType(key),
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await prisma.storedFile.delete({ where: { key } });
    } catch {
      // Ignore missing records
    }
  }
}

class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || "";
    this.client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async upload({
    folder,
    originalName,
    buffer,
    mimeType,
  }: {
    folder: StorageFolder;
    originalName: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<StoredFileResult> {
    const key = buildStorageKey(folder, originalName);
    const contentType = mimeType || guessMimeType(originalName);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return {
      key,
      fileName: originalName,
      size: buffer.length,
      mimeType: contentType,
    };
  }

  async read(key: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      if (!res.Body) return null;
      const bytes = await res.Body.transformToByteArray();
      return {
        buffer: Buffer.from(bytes),
        mimeType: res.ContentType || guessMimeType(key),
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}

let cachedStorage: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedStorage) return cachedStorage;
  if (process.env.STORAGE_DRIVER === "s3" && process.env.S3_BUCKET) {
    cachedStorage = new S3StorageProvider();
  } else {
    cachedStorage = new DatabaseStorageProvider();
  }
  return cachedStorage;
}

export function getFileDownloadUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}
