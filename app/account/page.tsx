import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Dashboard — SANAÉRA" };

export default async function AccountDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orderCount, wishlistCount, unreadNotifications, recentOrders, user] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { wishlist: { userId } } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      take: 3,
      include: { items: true },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-1">
        Welcome back, {user.firstName}.
      </h1>
      <p className="text-sm text-text-secondary mb-10">
        Member since {user.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
        {" · "}
        <span className="text-champagne uppercase tracking-wide text-xs">
          {user.customerSegment}
        </span>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line mb-14">
        <StatCard label="Orders" value={orderCount} href="/account/orders" />
        <StatCard label="Wishlist Items" value={wishlistCount} href="/account/wishlist" />
        <StatCard label="Unread Alerts" value={unreadNotifications} href="/account/notifications" />
        <StatCard
          label="Lifetime Spend"
          value={`₹${Number(user.lifetimeSpend).toLocaleString("en-IN")}`}
          href="/account/orders"
        />
      </div>

      <div className="flex justify-between items-end mb-6">
        <h2 className="font-display text-xl text-warmwhite">Recent Orders</h2>
        <Link href="/account/orders" className="text-[12px] text-champagne hover:underline">
          View all
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No orders yet.{" "}
          <Link href="/collections" className="text-champagne hover:underline">
            Start shopping →
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-px bg-line">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="bg-emerald-deep px-5 py-4 flex justify-between items-center hover:bg-emerald transition-colors"
            >
              <div>
                <div className="text-sm text-warmwhite">{order.orderNumber}</div>
                <div className="text-[12px] text-text-secondary">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                  {order.placedAt.toLocaleDateString("en-IN")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-warmwhite">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] uppercase tracking-wide text-champagne">
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

function StatCard({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="bg-emerald-deep p-6 hover:bg-emerald transition-colors">
      <div className="font-display text-3xl text-champagne">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mt-1">
        {label}
      </div>
    </Link>
  );
}
