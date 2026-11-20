import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE_NAME = "lb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "lingo-bridge-dev-fallback-secret-change-in-production-64-chars";
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  role: Role;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId === "string" && (payload.role === "USER" || payload.role === "ADMIN")) {
      return {
        userId: payload.userId,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      language: true,
      telegramId: true,
      telegramUsername: true,
      telegramChatId: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) return null;
  return {
    ...user,
    telegramId: user.telegramId ? user.telegramId.toString() : null,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 }),
    };
  }
  return { user, errorResponse: null };
}

export async function requireAdmin() {
  const { user, errorResponse } = await requireAuth();
  if (errorResponse || !user) {
    return { user: null, errorResponse };
  }
  if (user.role !== "ADMIN") {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Faqat administratorlar uchun ruxsat etilgan" }, { status: 403 }),
    };
  }
  return { user, errorResponse: null };
}
