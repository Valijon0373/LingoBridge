import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSessionToken, verifyPassword } from "@/lib/auth";
import { normalizeUzPhone } from "@/lib/utils";

const adminLoginSchema = z.object({
  login: z.string().trim().min(2, "Loginni kiriting").max(60),
  password: z.string().min(1, "Parolni kiriting").max(120),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Login yoki parol noto‘g‘ri" },
        { status: 400 }
      );
    }

    const rawLogin = parsed.data.login.trim();
    const { password } = parsed.data;
    const normalizedPhone = normalizeUzPhone(rawLogin);

    const user = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        isActive: true,
        OR: [
          { username: { equals: rawLogin, mode: "insensitive" } },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Login yoki parol noto‘g‘ri" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Login yoki parol noto‘g‘ri" },
        { status: 401 }
      );
    }

    const token = await signSessionToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        telegramUsername: user.telegramUsername,
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/admin-login]", error);
    return NextResponse.json({ error: "Server xatosi yuz berdi" }, { status: 500 });
  }
}
