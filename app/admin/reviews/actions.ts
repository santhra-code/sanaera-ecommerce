"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { ReviewStatus } from "@prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

export async function moderateReviewAction(
  reviewId: string,
  status: Extract<ReviewStatus, "APPROVED" | "REJECTED">
): Promise<ActionResult> {
  const admin = await requirePermission("review:moderate");

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return { success: false, error: "Review not found." };

  await prisma.review.update({ where: { id: reviewId }, data: { status } });

  // Keep the product's cached rating/count in sync with the approved set —
  // recomputed from scratch rather than incrementally, so it can't drift.
  const approved = await prisma.review.findMany({
    where: { productId: review.productId, status: "APPROVED" },
    select: { rating: true },
  });
  const avgRating = approved.length
    ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
    : 0;
  await prisma.product.update({
    where: { id: review.productId },
    data: { avgRating, reviewCount: approved.length },
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "review.moderate",
    entityType: "Review",
    entityId: reviewId,
    metadata: { from: review.status, to: status },
  });

  revalidatePath("/admin/reviews");
  return { success: true };
}
