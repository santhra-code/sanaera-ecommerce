import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditLog({
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  actorId: string;
  action: string; // "product.create", "order.refund", "coupon.delete", ...
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const headerList = await headers();
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    null;

  await prisma.auditLog.create({
    data: { actorId, action, entityType, entityId, metadata, ipAddress },
  });
}