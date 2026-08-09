"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { z } from "zod";

type ActionResult = { success: true } | { success: false; error: string };

const couponSchema = z.object({
  code: z.string().min(3).max(30),
  type: z.enum(["PERCENTAGE", "FLAT"]),
  value: z.number().positive(),
  minPurchase: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().default(1),
  expiresAt: z.string().optional(),
});

export async function createCouponAction(input: unknown): Promise<ActionResult> {
  const admin = await requirePermission("coupon:write");

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const code = data.code.toUpperCase();
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return { success: false, error: "A coupon with this code already exists." };

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: data.type,
      value: data.value,
      minPurchase: data.minPurchase,
      usageLimit: data.usageLimit,
      perUserLimit: data.perUserLimit,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "coupon.create",
    entityType: "Coupon",
    entityId: coupon.id,
    metadata: data,
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActiveAction(id: string): Promise<ActionResult> {
  const admin = await requirePermission("coupon:write");
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return { success: false, error: "Coupon not found." };

  await prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
  await writeAuditLog({
    actorId: admin.id,
    action: "coupon.toggle_active",
    entityType: "Coupon",
    entityId: id,
    metadata: { isActive: !coupon.isActive },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  const admin = await requirePermission("coupon:write");
  await prisma.coupon.delete({ where: { id } });
  await writeAuditLog({
    actorId: admin.id,
    action: "coupon.delete",
    entityType: "Coupon",
    entityId: id,
  });
  revalidatePath("/admin/coupons");
  return { success: true };
}
