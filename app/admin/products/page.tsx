import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import ProductRowActions from "@/components/admin/ProductRowActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products — Admin" };

type ProductWithRelations = Prisma.ProductGetPayload<{ include: { category: { select: { name: true } }; variants: { include: { inventory: true } } } }>;

function isNextBuild() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_BUILD_ID !== undefined ||
    process.env.npm_lifecycle_event === "build" ||
    process.argv.includes("build")
  );
}

export default async function AdminProductsPage() {
  await requirePermission("product:read");

  let products: ProductWithRelations[] = [];
  if (!isNextBuild()) {
    try {
      products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } }, variants: { include: { inventory: true } } },
      });
    } catch (error) {
      console.error("Admin products page: failed to load products", error);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <h1 className="font-display text-3xl text-warmwhite">Products</h1>
        <Link
          href="/admin/products/new"
          className="text-[12px] uppercase tracking-wide text-matte-black bg-champagne px-4 py-2.5 hover:bg-maroon transition-colors"
        >
          + New Product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Title</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3">Flags</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const totalStock = p.variants.reduce((sum, v) => sum + (v.inventory?.availableStock ?? 0), 0);
              const flags = [
                p.isFeatured && "Featured",
                p.isNewArrival && "New",
                p.isBestSeller && "Bestseller",
                p.isLimitedEdition && "Limited",
              ].filter(Boolean);
              return (
                <tr key={p.id} className="border-b border-line">
                  <td className="py-3 pr-4 text-warmwhite">
                    <Link href={`/admin/products/${p.id}/edit`} className="hover:text-champagne">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{p.category.name}</td>
                  <td className="py-3 pr-4 text-warmwhite">
                    ₹{Number(p.discountPrice ?? p.price).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">{totalStock}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-[11px] uppercase tracking-wide ${
                        p.status === "PUBLISHED" ? "text-champagne" : "text-text-secondary"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[11px] text-text-secondary">
                    {flags.join(", ") || "—"}
                  </td>
                  <td className="py-3">
                    <ProductRowActions productId={p.id} status={p.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-sm text-text-secondary mt-6">
            No products yet — run <code>npm run db:seed</code>, or create one above.
          </p>
        )}
      </div>
    </div>
  );
}
