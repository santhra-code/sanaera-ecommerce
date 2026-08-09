import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("product:write");
  const { id } = await params;

  const [product, categories, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, variants: { include: { inventory: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-[12px] text-champagne hover:underline">
        ← Back to products
      </Link>
      <h1 className="font-display text-3xl text-warmwhite mt-4 mb-8">Edit Product</h1>

      <ProductForm
        categories={categories}
        collections={collections}
        productId={product.id}
        initial={{
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          sku: product.sku,
          barcode: product.barcode ?? "",
          categoryId: product.categoryId,
          collectionId: product.collectionId ?? "",
          status: product.status,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isTrending: product.isTrending,
          isBestSeller: product.isBestSeller,
          isLimitedEdition: product.isLimitedEdition,
          fabric: product.fabric ?? "",
          occasion: product.occasion ?? "",
          craftRegion: product.craftRegion ?? "",
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          images: product.images.map((img) => ({ url: img.url, publicId: img.publicId, alt: img.alt ?? "" })),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size ?? "",
            color: v.color ?? "",
            sku: v.sku,
            price: v.price ? Number(v.price) : null,
            availableStock: v.inventory?.availableStock ?? 0,
            lowStockThreshold: v.inventory?.lowStockThreshold ?? 5,
          })),
        }}
      />
    </div>
  );
}
