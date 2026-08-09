"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

type ActionResult = { success: true } | { success: false; error: string };

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createCategoryAction(name: string): Promise<ActionResult> {
  const admin = await requirePermission("category:write");
  if (!name.trim()) return { success: false, error: "Name is required." };

  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A category with this name already exists." };

  const category = await prisma.category.create({ data: { name: name.trim(), slug } });
  await writeAuditLog({
    actorId: admin.id,
    action: "category.create",
    entityType: "Category",
    entityId: category.id,
    metadata: { name },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const admin = await requirePermission("category:write");

  const inUse = await prisma.product.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return { success: false, error: `${inUse} product(s) still use this category.` };
  }

  await prisma.category.delete({ where: { id } });
  await writeAuditLog({
    actorId: admin.id,
    action: "category.delete",
    entityType: "Category",
    entityId: id,
  });

  revalidatePath("/admin/categories");
  return { success: true };
}
