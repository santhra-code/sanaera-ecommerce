import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
  await requirePermission("order:read");

  const orders = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
    take: 100,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Orders</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Order</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Placed</th>
              <th className="py-3 pr-4">Total</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line">
                <td className="py-3 pr-4 text-warmwhite">{o.orderNumber}</td>
                <td className="py-3 pr-4 text-text-secondary">
                  {o.user.firstName} {o.user.lastName}
                  <div className="text-[11px]">{o.user.email}</div>
                </td>
                <td className="py-3 pr-4 text-text-secondary">
                  {o.placedAt.toLocaleDateString("en-IN")}
                </td>
                <td className="py-3 pr-4 text-warmwhite">
                  ₹{Number(o.total).toLocaleString("en-IN")}
                </td>
                <td className="py-3 pr-4">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
                <td className="py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-champagne hover:underline text-[12px]">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-sm text-text-secondary mt-6">No orders yet.</p>}
      </div>
    </div>
  );
}
