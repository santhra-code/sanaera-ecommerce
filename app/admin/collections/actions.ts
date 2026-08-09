"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

type ActionResult = { success: true } | { success: false; error: string };

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createCollectionAction(name: string): Promise<ActionResult> {
  const admin = await requirePermission("collection:write");
  if (!name.trim()) return { success: false, error: "Name is required." };

  const slug = slugify(name);
  const existing = await prisma.collection.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A collection with this name already exists." };

  const collection = await prisma.collection.create({ data: { name: name.trim(), slug } });
  await writeAuditLog({
    actorId: admin.id,
    action: "collection.create",
    entityType: "Collection",
    entityId: collection.id,
    metadata: { name },
  });

  revalidatePath("/admin/collections");
  return { success: true };
}

export async function toggleCollectionActiveAction(id: string): Promise<ActionResult> {
  const admin = await requirePermission("collection:write");
  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection) return { success: false, error: "Collection not found." };

  await prisma.collection.update({ where: { id }, data: { isActive: !collection.isActive } });
  await writeAuditLog({
    actorId: admin.id,
    action: "collection.toggle_active",
    entityType: "Collection",
    entityId: id,
    metadata: { isActive: !collection.isActive },
  });

  revalidatePath("/admin/collections");
  return { success: true };
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  const admin = await requirePermission("collection:write");

  const inUse = await prisma.product.count({ where: { collectionId: id } });
  if (inUse > 0) {
    return { success: false, error: `${inUse} product(s) still use this collection.` };
  }

  await prisma.collection.delete({ where: { id } });
  await writeAuditLog({
    actorId: admin.id,
    action: "collection.delete",
    entityType: "Collection",
    entityId: id,
  });

  revalidatePath("/admin/collections");
  return { success: true };
}
