"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateStockAction(
  variantId: string,
  availableStock: number,
  lowStockThreshold: number
): Promise<ActionResult> {
  const admin = await requirePermission("inventory:write");
  if (availableStock < 0 || lowStockThreshold < 0) {
    return { success: false, error: "Values can't be negative." };
  }

  await prisma.inventory.update({
    where: { variantId },
    data: { availableStock, lowStockThreshold },
  });
  await writeAuditLog({
    actorId: admin.id,
    action: "inventory.update",
    entityType: "ProductVariant",
    entityId: variantId,
    metadata: { availableStock, lowStockThreshold },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { success: true };
}
