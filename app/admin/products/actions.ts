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
  try {
    const admin = await requirePermission("product:write");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, error: "Product not found." };

    const nextStatus =
      product.status === ProductStatus.PUBLISHED ? ProductStatus.DRAFT : ProductStatus.PUBLISHED;
    await prisma.product.update({ where: { id: productId }, data: { status: nextStatus } });

    try {
      await writeAuditLog({
        actorId: admin.id,
        action: "product.toggle_status",
        entityType: "Product",
        entityId: productId,
        metadata: { from: product.status, to: nextStatus },
      });
    } catch (auditErr) {
      console.error("Failed to write audit log:", auditErr);
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: any) {
    console.error("Error in toggleProductStatusAction:", err);
    return { success: false, error: err?.message || "Failed to update product status." };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
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

    try {
      await writeAuditLog({
        actorId: admin.id,
        action: "product.delete",
        entityType: "Product",
        entityId: productId,
        metadata: { title: product.title },
      });
    } catch (auditErr) {
      console.error("Failed to write audit log:", auditErr);
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteProductAction:", err);
    return { success: false, error: err?.message || "Failed to delete product." };
  }
}

export async function createProductAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
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

    // Check variant SKU uniqueness across existing variants
    for (const variant of data.variants) {
      const existingVarSku = await prisma.productVariant.findUnique({ where: { sku: variant.sku } });
      if (existingVarSku) {
        return { success: false, error: `Variant SKU "${variant.sku}" is already in use.` };
      }
    }

    const product = await prisma.$transaction(
      async (tx) => {
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
      },
      { maxWait: 10000, timeout: 30000 }
    );

    try {
      await writeAuditLog({
        actorId: admin.id,
        action: "product.create",
        entityType: "Product",
        entityId: product.id,
        metadata: { title: product.title, sku: product.sku },
      });
    } catch (auditErr) {
      console.error("Failed to write audit log:", auditErr);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: { id: product.id } };
  } catch (err: any) {
    console.error("Error in createProductAction:", err);
    return { success: false, error: err?.message || "Failed to create product." };
  }
}

export async function updateProductAction(
  productId: string,
  input: unknown
): Promise<ActionResult> {
  try {
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

    // Check variant SKU uniqueness across all variants except those owned by this product
    for (const variant of data.variants) {
      const existingVarSku = await prisma.productVariant.findUnique({ where: { sku: variant.sku } });
      if (existingVarSku && existingVarSku.productId !== productId) {
        return { success: false, error: `Variant SKU "${variant.sku}" is already in use by another product.` };
      }
    }

    const keptImageIds = new Set(data.images.map((i) => i.publicId));
    const removedImages = existing.images.filter((img) => !keptImageIds.has(img.publicId));

    const keptVariantIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id));
    const removedVariants = existing.variants.filter((v) => !keptVariantIds.has(v.id));

    await prisma.$transaction(
      async (tx) => {
        await tx.product.update({ where: { id: productId }, data: toProductCreateData(data) });

        // Images: delete removed
        if (removedImages.length > 0) {
          await tx.productImage.deleteMany({ where: { id: { in: removedImages.map((i) => i.id) } } });
        }

        // Update existing images or create new ones
        for (let i = 0; i < data.images.length; i++) {
          const img = data.images[i];
          const existingImg = existing.images.find((e) => e.publicId === img.publicId);
          if (existingImg) {
            await tx.productImage.update({
              where: { id: existingImg.id },
              data: {
                url: img.url,
                alt: img.alt || null,
                position: i,
              },
            });
          } else {
            await tx.productImage.create({
              data: {
                productId,
                url: img.url,
                publicId: img.publicId,
                alt: img.alt || null,
                position: i,
              },
            });
          }
        }

        // Variants: delete removed (cascades their Inventory row), update kept, create new
        for (const removed of removedVariants) {
          await tx.productVariant.delete({ where: { id: removed.id } });
        }

        for (const variant of data.variants) {
          if (variant.id && existing.variants.some((v) => v.id === variant.id)) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                size: variant.size || null,
                color: variant.color || null,
                sku: variant.sku,
                price: variant.price ?? null,
              },
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
      },
      { maxWait: 10000, timeout: 30000 }
    );

    // Cloudinary cleanup for images actually removed from this product
    if (removedImages.length > 0) {
      await Promise.all(removedImages.map((img) => deleteCloudinaryImage(img.publicId)));
    }

    try {
      await writeAuditLog({
        actorId: admin.id,
        action: "product.update",
        entityType: "Product",
        entityId: productId,
        metadata: { title: data.title },
      });
    } catch (auditErr) {
      console.error("Failed to write audit log:", auditErr);
    }

    revalidatePath("/admin/products");
    if (existing.slug !== data.slug) {
      revalidatePath(`/product/${existing.slug}`);
    }
    revalidatePath(`/product/${data.slug}`);
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error in updateProductAction:", err);
    return { success: false, error: err?.message || "Failed to update product." };
  }
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

