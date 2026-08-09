import Link from "next/link";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Shipping — Admin" };

export default async function AdminShippingPage() {
  await requirePermission("order:read");

  const orders = await prisma.order.findMany({
    where: { status: { in: ["CONFIRMED", "PACKING", "SHIPPED"] } },
    orderBy: { placedAt: "asc" },
    include: { user: { select: { firstName: true, lastName: true } }, shippingAddress: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-2">Shipping</h1>
      <p className="text-sm text-text-secondary mb-8">
        Orders currently in fulfillment. Update tracking from the order detail page.
      </p>

      <div className="flex flex-col gap-px bg-line">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className="bg-emerald-deep px-6 py-4 flex justify-between items-center hover:bg-emerald transition-colors"
          >
            <div>
              <div className="text-sm text-warmwhite">{o.orderNumber}</div>
              <div className="text-[12px] text-text-secondary">
                {o.user.firstName} {o.user.lastName} · {o.shippingAddress.city}, {o.shippingAddress.state}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-champagne">{o.status}</div>
              {o.trackingNumber && (
                <div className="text-[11px] text-text-secondary">{o.trackingNumber}</div>
              )}
            </div>
          </Link>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-text-secondary py-6">Nothing in fulfillment right now.</p>
        )}
      </div>
    </div>
  );
}
