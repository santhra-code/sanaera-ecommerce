import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("customer:read");
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { placedAt: "desc" }, take: 20 },
      wishlist: { include: { items: true } },
    },
  });
  if (!customer) notFound();

  return (
    <div>
      <Link href="/admin/customers" className="text-[12px] text-champagne hover:underline">
        ← Back to customers
      </Link>

      <div className="flex justify-between items-start mt-4 mb-10">
        <div>
          <h1 className="font-display text-3xl text-warmwhite">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-[13px] text-text-secondary mt-1">
            {customer.email} {customer.phone ? `· ${customer.phone}` : ""}
          </p>
        </div>
        <span className="text-[11px] uppercase tracking-wide text-champagne border border-champagne px-3 py-1.5">
          {customer.customerSegment}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line mb-10">
        <Stat label="Orders" value={customer.orderCount} />
        <Stat label="Lifetime Spend" value={`₹${Number(customer.lifetimeSpend).toLocaleString("en-IN")}`} />
        <Stat label="Wishlist Items" value={customer.wishlist?.items.length ?? 0} />
        <Stat label="Verified" value={customer.isVerified ? "Yes" : "No"} />
      </div>

      <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-3">
        Recent Orders
      </h3>
      <div className="flex flex-col gap-px bg-line mb-10">
        {customer.orders.map((o) => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className="bg-emerald-deep px-5 py-3 flex justify-between hover:bg-emerald transition-colors"
          >
            <span className="text-sm text-warmwhite">{o.orderNumber}</span>
            <span className="text-[12px] text-champagne">
              ₹{Number(o.total).toLocaleString("en-IN")} · {o.status}
            </span>
          </Link>
        ))}
        {customer.orders.length === 0 && (
          <p className="text-sm text-text-secondary py-4">No orders yet.</p>
        )}
      </div>

      <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-3">Addresses</h3>
      <div className="grid sm:grid-cols-2 gap-px bg-line">
        {customer.addresses.map((a) => (
          <div key={a.id} className="bg-emerald-deep p-4 text-sm text-warmwhite">
            <div className="text-[10.5px] uppercase tracking-wide text-champagne mb-1.5">{a.type}</div>
            {a.fullName}, {a.line1}, {a.city}, {a.state} {a.postalCode}
          </div>
        ))}
        {customer.addresses.length === 0 && (
          <p className="text-sm text-text-secondary py-4">No saved addresses.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-emerald-deep p-5">
      <div className="font-display text-2xl text-champagne">{value}</div>
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-text-secondary mt-1">{label}</div>
    </div>
  );
}
