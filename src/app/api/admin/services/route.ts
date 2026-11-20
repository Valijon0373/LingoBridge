import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { serviceCreateSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { orders: true } },
    },
  });

  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  try {
    const body = await request.json();
    const parsed = serviceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Xizmat ma’lumotlari noto‘g‘ri" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(parsed.data.nameUz) || `service-${Date.now()}`;
    const existingSlug = await prisma.service.findUnique({ where: { slug: baseSlug } });
    const slug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const service = await prisma.service.create({
      data: {
        slug,
        ...parsed.data,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      targetType: "SERVICE",
      targetId: service.id,
      action: "CREATE_SERVICE",
      details: { nameUz: service.nameUz, price: service.price, pricingType: service.pricingType },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/services]", error);
    return NextResponse.json({ error: "Xizmat yaratib bo‘lmadi" }, { status: 500 });
  }
}
