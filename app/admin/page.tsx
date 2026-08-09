import Link from "next/link";
import { requireAdminTier } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin Dashboard — SANAÉRA" };

export default async function AdminDashboardPage() {
  await requireAdminTier();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(startOfMonth.getDate() - 30);

  const [today, week, month, statusCounts, lowStockCandidates, recentOrders, segmentCounts] = await Promise.all([
    salesSince(startOfToday),
    salesSince(startOfWeek),
    salesSince(startOfMonth),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    // Prisma's fluent `where` can't compare two columns of the same row
    // (availableStock <= lowStockThreshold) without $queryRaw — fine at
    // this catalog size, but worth moving to a raw query if the product
    // count grows into the thousands the brief mentions.
    prisma.inventory.findMany({
      include: { variant: { include: { product: { select: { title: true } } } } },
    }),
    prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 8,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.user.groupBy({ by: ["customerSegment"], _count: true }),
  ]);
  const lowStock = lowStockCandidates
    .filter((inv) => inv.availableStock <= inv.lowStockThreshold)
    .slice(0, 10);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-warmwhite mb-3">Dashboard</h1>
          <p className="text-sm text-text-secondary max-w-2xl">
            Use the admin dashboard to manage products, orders, inventory and more.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="text-[12px] uppercase tracking-wide bg-champagne text-matte-black px-4 py-3 hover:bg-maroon hover:text-warmwhite transition-colors"
          >
            + Create New Product
          </Link>
          <Link
            href="/admin/products"
            className="text-[12px] uppercase tracking-wide border border-line text-warmwhite px-4 py-3 hover:bg-emerald hover:text-champagne transition-colors"
          >
            Manage Products
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line mb-10">
        <SalesCard label="Today" data={today} />
        <SalesCard label="Last 7 Days" data={week} />
        <SalesCard label="Last 30 Days" data={month} />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="font-display text-xl text-warmwhite mb-4">Orders by Status</h2>
          <div className="flex flex-col gap-px bg-line">
            {statusCounts.map((s) => (
              <div key={s.status} className="bg-emerald-deep px-5 py-3 flex justify-between">
                <span className="text-[12.5px] uppercase tracking-wide text-text-secondary">
                  {s.status}
                </span>
                <span className="text-warmwhite text-sm">{s._count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl text-warmwhite mb-4">Customer Segments</h2>
          <div className="flex flex-col gap-px bg-line">
            {segmentCounts.map((s) => (
              <div key={s.customerSegment} className="bg-emerald-deep px-5 py-3 flex justify-between">
                <span className="text-[12.5px] uppercase tracking-wide text-text-secondary">
                  {s.customerSegment}
                </span>
                <span className="text-warmwhite text-sm">{s._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-display text-xl text-warmwhite">Low Stock</h2>
            <Link href="/admin/inventory" className="text-[12px] text-champagne hover:underline">
              View all
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-text-secondary">Nothing running low.</p>
          ) : (
            <div className="flex flex-col gap-px bg-line">
              {lowStock.map((inv) => (
                <div key={inv.id} className="bg-emerald-deep px-5 py-3 flex justify-between">
                  <span className="text-[13px] text-warmwhite">
                    {inv.variant.product.title}
                    {inv.variant.size ? ` · ${inv.variant.size}` : ""}
                  </span>
                  <span className="text-[12.5px] text-maroon">{inv.availableStock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-display text-xl text-warmwhite">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[12px] text-champagne hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-px bg-line">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="bg-emerald-deep px-5 py-3 flex justify-between hover:bg-emerald transition-colors"
              >
                <span className="text-[13px] text-warmwhite">
                  {o.orderNumber} · {o.user.firstName} {o.user.lastName}
                </span>
                <span className="text-[12.5px] text-champagne">
                  ₹{Number(o.total).toLocaleString("en-IN")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function salesSince(date: Date) {
  const result = await prisma.order.aggregate({
    where: { placedAt: { gte: date }, status: { notIn: ["CANCELLED"] } },
    _sum: { total: true },
    _count: true,
  });
  return { total: Number(result._sum.total ?? 0), count: result._count };
}

function SalesCard({ label, data }: { label: string; data: { total: number; count: number } }) {
  return (
    <div className="bg-emerald-deep p-6">
      <div className="font-display text-3xl text-champagne">
        ₹{data.total.toLocaleString("en-IN")}
      </div>
      <div className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mt-1">
        {label} · {data.count} order{data.count !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
