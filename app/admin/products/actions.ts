"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { ProductStatus } from "@prisma/client";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function toggleProductStatusAction(productId: string): Promise<ActionResult> {
  const admin = await requirePermission("product:write");

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { success: false, error: "Product not found." };

  const nextStatus =
    product.status === ProductStatus.PUBLISHED ? ProductStatus.DRAFT : ProductStatus.PUBLISHED;
  await prisma.product.update({ where: { id: productId }, data: { status: nextStatus } });

  await writeAuditLog({
    actorId: admin.id,
    action: "product.toggle_status",
    entityType: "Product",
    entityId: productId,
    metadata: { from: product.status, to: nextStatus },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const admin = await requirePermission("product:delete");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });
  if (!product) return { success: false, error: "Product not found." };

  await prisma.product.delete({ where: { id: productId } });
  // Best-effort cleanup after the DB row is gone — see deleteCloudinaryImage's
  // comment on why a failure here doesn't roll back the deletion.
  await Promise.all(product.images.map((img) => deleteCloudinaryImage(img.publicId)));

  await writeAuditLog({
    actorId: admin.id,
    action: "product.delete",
    entityType: "Product",
    entityId: productId,
    metadata: { title: product.title },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function createProductAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requirePermission("product:write");

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const [existingSlug, existingSku] = await Promise.all([
    prisma.product.findUnique({ where: { slug: data.slug } }),
    prisma.product.findUnique({ where: { sku: data.sku } }),
  ]);
  if (existingSlug) return { success: false, error: "That slug is already in use." };
  if (existingSku) return { success: false, error: "That SKU is already in use." };

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data: toProductCreateData(data) });

    for (const [i, img] of data.images.entries()) {
      await tx.productImage.create({
        data: { productId: created.id, url: img.url, publicId: img.publicId, alt: img.alt || null, position: i },
      });
    }
    for (const variant of data.variants) {
      const createdVariant = await tx.productVariant.create({
        data: {
          productId: created.id,
          size: variant.size || null,
          color: variant.color || null,
          sku: variant.sku,
          price: variant.price ?? null,
        },
      });
      await tx.inventory.create({
        data: {
          variantId: createdVariant.id,
          availableStock: variant.availableStock,
          lowStockThreshold: variant.lowStockThreshold,
        },
      });
    }
    return created;
  });

  await writeAuditLog({
    actorId: admin.id,
    action: "product.create",
    entityType: "Product",
    entityId: product.id,
    metadata: { title: product.title, sku: product.sku },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true, data: { id: product.id } };
}

export async function updateProductAction(
  productId: string,
  input: unknown
): Promise<ActionResult> {
  const admin = await requirePermission("product:write");

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true, variants: true },
  });
  if (!existing) return { success: false, error: "Product not found." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  if (data.slug !== existing.slug) {
    const clash = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (clash) return { success: false, error: "That slug is already in use." };
  }
  if (data.sku !== existing.sku) {
    const clash = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (clash) return { success: false, error: "That SKU is already in use." };
  }

  const keptImageIds = new Set(data.images.map((i) => i.publicId));
  const removedImages = existing.images.filter((img) => !keptImageIds.has(img.publicId));

  const keptVariantIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id));
  const removedVariants = existing.variants.filter((v) => !keptVariantIds.has(v.id));

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data: toProductCreateData(data) });

    // Images: delete removed, create newly-added (existing kept ones are
    // immutable besides position/alt, which we just rewrite wholesale below).
    await tx.productImage.deleteMany({ where: { id: { in: removedImages.map((i) => i.id) } } });
    for (const img of data.images) {
      await tx.productImage.upsert({
        where: {
          // No natural unique key on (productId, publicId) in the schema,
          // so fall back to find-or-create semantics via publicId lookup.
          id: existing.images.find((e) => e.publicId === img.publicId)?.id ?? "__new__",
        },
        update: { alt: img.alt || null },
        create: {
          productId,
          url: img.url,
          publicId: img.publicId,
          alt: img.alt || null,
          position: data.images.indexOf(img),
        },
      });
    }

    // Variants: delete removed (cascades their Inventory row), update kept,
    // create new — each new variant also gets its Inventory row.
    for (const removed of removedVariants) {
      await tx.productVariant.delete({ where: { id: removed.id } });
    }
    for (const variant of data.variants) {
      if (variant.id) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { size: variant.size || null, color: variant.color || null, sku: variant.sku, price: variant.price ?? null },
        });
        await tx.inventory.upsert({
          where: { variantId: variant.id },
          update: { availableStock: variant.availableStock, lowStockThreshold: variant.lowStockThreshold },
          create: {
            variantId: variant.id,
            availableStock: variant.availableStock,
            lowStockThreshold: variant.lowStockThreshold,
          },
        });
      } else {
        const created = await tx.productVariant.create({
          data: {
            productId,
            size: variant.size || null,
            color: variant.color || null,
            sku: variant.sku,
            price: variant.price ?? null,
          },
        });
        await tx.inventory.create({
          data: {
            variantId: created.id,
            availableStock: variant.availableStock,
            lowStockThreshold: variant.lowStockThreshold,
          },
        });
      }
    }
  });

  // Cloudinary cleanup for images actually removed from this product,
  // outside the transaction (external API call, best-effort per
  // deleteCloudinaryImage's own error handling).
  await Promise.all(removedImages.map((img) => deleteCloudinaryImage(img.publicId)));

  await writeAuditLog({
    actorId: admin.id,
    action: "product.update",
    entityType: "Product",
    entityId: productId,
    metadata: { title: data.title },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/");
  return { success: true };
}

function toProductCreateData(data: ProductInput) {
  return {
    title: data.title,
    slug: data.slug,
    description: data.description,
    price: data.price,
    discountPrice: data.discountPrice ?? null,
    sku: data.sku,
    barcode: data.barcode || null,
    categoryId: data.categoryId,
    collectionId: data.collectionId || null,
    status: data.status as ProductStatus,
    isFeatured: data.isFeatured,
    isNewArrival: data.isNewArrival,
    isTrending: data.isTrending,
    isBestSeller: data.isBestSeller,
    isLimitedEdition: data.isLimitedEdition,
    fabric: data.fabric || null,
    occasion: data.occasion || null,
    craftRegion: data.craftRegion || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
  };
}
