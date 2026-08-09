import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import StockEditor from "@/components/admin/StockEditor";

export const metadata = { title: "Inventory — Admin" };

export default async function AdminInventoryPage() {
  await requirePermission("inventory:read");

  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { title: true } }, inventory: true },
    orderBy: { product: { title: "asc" } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Inventory</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Product</th>
              <th className="py-3 pr-4">SKU</th>
              <th className="py-3 pr-4">Reserved</th>
              <th className="py-3 pr-4">Sold</th>
              <th className="py-3">Available / Low-stock threshold</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-line">
                <td className="py-3 pr-4 text-warmwhite">
                  {v.product.title} {v.size ? `· ${v.size}` : ""}
                </td>
                <td className="py-3 pr-4 text-text-secondary">{v.sku}</td>
                <td className="py-3 pr-4 text-text-secondary">{v.inventory?.reservedStock ?? 0}</td>
                <td className="py-3 pr-4 text-text-secondary">{v.inventory?.soldStock ?? 0}</td>
                <td className="py-3">
                  <StockEditor
                    variantId={v.id}
                    availableStock={v.inventory?.availableStock ?? 0}
                    lowStockThreshold={v.inventory?.lowStockThreshold ?? 5}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {variants.length === 0 && <p className="text-sm text-text-secondary mt-6">No product variants yet.</p>}
      </div>
    </div>
  );
}
