import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(), // present when editing an existing variant
  size: z.string().max(30).optional().or(z.literal("")),
  color: z.string().max(30).optional().or(z.literal("")),
  sku: z.string().min(1, "Variant SKU is required").max(60),
  price: z.number().positive().optional().nullable(), // overrides product.price when set
  availableStock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().max(160).optional().or(z.literal("")),
  position: z.coerce.number().int().min(0).optional(),
});

export const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU is required").max(60),
  barcode: z.string().max(60).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  collectionId: z.string().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isLimitedEdition: z.boolean().default(false),
  fabric: z.string().max(120).optional().or(z.literal("")),
  occasion: z.string().max(120).optional().or(z.literal("")),
  craftRegion: z.string().max(120).optional().or(z.literal("")),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  images: z.array(productImageSchema).default([]),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});

export const publicProductSchema = productSchema
  .omit({ categoryId: true, collectionId: true })
  .extend({
    category: z.string().min(1, "Category is required"),
    collection: z.string().max(120).optional().or(z.literal("")),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  });

export type ProductInput = z.infer<typeof productSchema>;
export type PublicProductInput = z.infer<typeof publicProductSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
