import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { serviceUpdateSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/audit";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = serviceUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Noto‘g‘ri ma’lumot" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id },
      data: parsed.data,
    });

    await logAdminAction({
      adminId: admin.id,
      targetType: "SERVICE",
      targetId: service.id,
      action: "UPDATE_SERVICE",
      details: { nameUz: service.nameUz, isActive: service.isActive, price: service.price },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error("[PATCH /api/admin/services/[id]]", error);
    return NextResponse.json({ error: "Xizmatni yangilab bo‘lmadi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const { id } = await context.params;

  try {
    const orderCount = await prisma.order.count({ where: { serviceId: id } });
    if (orderCount > 0) {
      // Soft-deactivate if historical orders reference this service
      const deactivated = await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
      await logAdminAction({
        adminId: admin.id,
        targetType: "SERVICE",
        targetId: id,
        action: "DEACTIVATE_SERVICE",
        details: { reason: "has_existing_orders", orderCount },
      });
      return NextResponse.json({ service: deactivated, softDeleted: true });
    }

    await prisma.service.delete({ where: { id } });
    await logAdminAction({
      adminId: admin.id,
      targetType: "SERVICE",
      targetId: id,
      action: "DELETE_SERVICE",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/services/[id]]", error);
    return NextResponse.json({ error: "Xizmatni o‘chirib bo‘lmadi" }, { status: 500 });
  }
}
