import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDirection, formatUzPhone } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  const { user: admin, errorResponse } = await requireAdmin();
  if (errorResponse || !admin) return errorResponse!;

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, phone: true } },
      service: { select: { nameUz: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Lingo Bridge";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Buyurtmalar", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "№", key: "index", width: 6 },
    { header: "Buyurtma raqami", key: "orderNumber", width: 16 },
    { header: "Mijoz", key: "customer", width: 24 },
    { header: "Telefon", key: "phone", width: 19 },
    { header: "Xizmat", key: "service", width: 28 },
    { header: "Yo‘nalish", key: "direction", width: 18 },
    { header: "Fayl nomi", key: "fileName", width: 28 },
    { header: "Sahifa", key: "pages", width: 10 },
    { header: "Birlik narxi", key: "unitPrice", width: 16 },
    { header: "Jami summa", key: "totalPrice", width: 18 },
    { header: "Holati", key: "status", width: 18 },
    { header: "Sana", key: "createdAt", width: 20 },
  ];

  // Styled academic navy header row (#1F4E79)
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E79" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  orders.forEach((order, idx) => {
    const row = sheet.addRow({
      index: idx + 1,
      orderNumber: `#${order.orderNumber}`,
      customer: `${order.user.firstName} ${order.user.lastName}`.trim(),
      phone: formatUzPhone(order.user.phone),
      service: order.service.nameUz,
      direction: formatDirection(order.sourceLanguage, order.targetLanguage, "uz"),
      fileName: order.originalFileName,
      pages: order.pageCount,
      unitPrice: order.unitPrice,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt.toISOString().replace("T", " ").slice(0, 16),
    });

    row.height = 22;
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 1 || colNumber === 8 ? "center" : "left",
      };
      if (colNumber === 9 || colNumber === 10) {
        cell.numFmt = '#,##0" so‘m"';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  await logAdminAction({
    adminId: admin.id,
    targetType: "ORDER",
    action: "EXPORT_ORDERS_EXCEL",
    details: { exportedCount: orders.length },
  });

  const dateStamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="lingobridge-orders-${dateStamp}.xlsx"`,
    },
  });
}
