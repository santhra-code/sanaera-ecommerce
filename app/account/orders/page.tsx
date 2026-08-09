import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Orders — SANAÉRA" };

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-text-secondary",
  CONFIRMED: "text-champagne",
  PACKING: "text-champagne",
  SHIPPED: "text-champagne",
  DELIVERED: "text-champagne",
  CANCELLED: "text-maroon",
  RETURNED: "text-maroon",
  REFUNDED: "text-maroon",
};

export default async function OrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { placedAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No orders yet.{" "}
          <Link href="/collections" className="text-champagne hover:underline">
            Start shopping →
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-px bg-line">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="bg-emerald-deep px-6 py-5 flex justify-between items-center hover:bg-emerald transition-colors"
            >
              <div>
                <div className="text-sm text-warmwhite mb-1">{order.orderNumber}</div>
                <div className="text-[12px] text-text-secondary">
                  Placed {order.placedAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  {" · "}
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-warmwhite mb-1">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </div>
                <div className={`text-[11px] uppercase tracking-wide ${STATUS_COLOR[order.status]}`}>
                  {order.status}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
