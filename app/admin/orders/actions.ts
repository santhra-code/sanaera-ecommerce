"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { OrderStatus } from "@prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  const admin = await requirePermission("order:update_status");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { success: false, error: "Order not found." };

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  await writeAuditLog({
    actorId: admin.id,
    action: "order.update_status",
    entityType: "Order",
    entityId: orderId,
    metadata: { from: order.status, to: status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updateTrackingAction(
  orderId: string,
  data: { trackingNumber: string; trackingCarrier: string }
): Promise<ActionResult> {
  const admin = await requirePermission("order:update_status");

  await prisma.order.update({
    where: { id: orderId },
    data: { trackingNumber: data.trackingNumber, trackingCarrier: data.trackingCarrier },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "order.update_tracking",
    entityType: "Order",
    entityId: orderId,
    metadata: data,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/shipping");
  return { success: true };
}
