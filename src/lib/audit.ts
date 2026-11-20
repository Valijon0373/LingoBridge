import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export async function logAdminAction(params: {
  adminId: string;
  orderId?: string | null;
  targetType: "ORDER" | "SERVICE" | "BROADCAST" | "USER" | "TELEGRAM";
  targetId?: string | null;
  action: string;
  details?: Prisma.InputJsonValue;
}) {
  return prisma.adminAction.create({
    data: {
      adminId: params.adminId,
      orderId: params.orderId ?? null,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      action: params.action,
      details: params.details,
    },
  });
}

export async function createUserNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: "ORDER" | "PAYMENT" | "BROADCAST" | "SYSTEM";
  orderId?: string | null;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type ?? "ORDER",
      orderId: params.orderId ?? null,
    },
  });
}
