import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSessionToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Telefon yoki parol noto‘g‘ri" },
        { status: 400 }
      );
    }

    const { phone, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || !user.passwordHash || !user.isActive) {
      return NextResponse.json(
        { error: "Telefon raqam yoki parol noto‘g‘ri" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Telefon raqam yoki parol noto‘g‘ri" },
        { status: 401 }
      );
    }

    const token = await signSessionToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        telegramUsername: user.telegramUsername,
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Server xatosi yuz berdi" }, { status: 500 });
  }
}
