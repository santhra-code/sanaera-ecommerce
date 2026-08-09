import Link from "next/link";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  await requirePermission("product:write");

  const [categories, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <Link href="/admin/products" className="text-[12px] text-champagne hover:underline">
        ← Back to products
      </Link>
      <h1 className="font-display text-3xl text-warmwhite mt-4 mb-8">New Product</h1>

      {categories.length === 0 ? (
        <p className="text-sm text-maroon">
          Create at least one category first — products need one to belong to.
        </p>
      ) : (
        <ProductForm categories={categories} collections={collections} />
      )}
    </div>
  );
}
