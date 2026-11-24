import { prisma } from "./prisma";
import type { ServiceDTO } from "@/types";

export async function getActiveServicesSafe(): Promise<ServiceDTO[]> {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
