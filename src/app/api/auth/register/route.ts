import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie, signSessionToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ma’lumotlar noto‘g‘ri" },
        { status: 400 }
      );
    }

    const { phone, firstName, lastName, password, language } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu telefon raqam allaqachon ro‘yxatdan o‘tgan" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        phone,
        firstName,
        lastName,
        passwordHash,
        language,
        role: "USER",
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
      },
    });

    const token = await signSessionToken({ userId: user.id, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ error: "Server xatosi yuz berdi" }, { status: 500 });
  }
}
