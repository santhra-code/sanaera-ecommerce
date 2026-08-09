import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { title: true, slug: true } } } },
      payment: true,
      billingAddress: true,
      shippingAddress: true,
    },
  });

  // 404 for both "doesn't exist" and "belongs to someone else" — identical
  // response either way, so an order id can't be used to probe for existence.
  if (!order || order.userId !== session!.user.id) notFound();

  return (
    <div>
      <Link href="/account/orders" className="text-[12px] text-champagne hover:underline">
        ← Back to orders
      </Link>

      <div className="flex justify-between items-start mt-4 mb-10">
        <div>
          <h1 className="font-display text-3xl text-warmwhite">{order.orderNumber}</h1>
          <p className="text-[13px] text-text-secondary mt-1">
            Placed {order.placedAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className="text-[11px] uppercase tracking-wide text-champagne border border-champagne px-3 py-1.5">
          {order.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-emerald-deep p-6">
          <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-3">
            Shipping Address
          </h3>
          <p className="text-sm text-warmwhite leading-relaxed">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? <>, {order.shippingAddress.line2}</> : null}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.phone}
          </p>
          {order.trackingNumber && (
            <p className="text-[12px] text-text-secondary mt-3">
              Tracking: <span className="text-champagne">{order.trackingNumber}</span>
              {order.trackingCarrier ? ` (${order.trackingCarrier})` : ""}
            </p>
          )}
        </div>
        <div className="bg-emerald-deep p-6">
          <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-3">
            Payment
          </h3>
          <p className="text-sm text-warmwhite">
            {order.payment?.method ?? "—"} · {order.payment?.status ?? "PENDING"}
          </p>
          {order.giftNote && (
            <p className="text-[12px] text-text-secondary mt-3 italic">"{order.giftNote}"</p>
          )}
        </div>
      </div>

      <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-3">Items</h3>
      <div className="flex flex-col gap-px bg-line mb-8">
        {order.items.map((item) => (
          <div key={item.id} className="bg-emerald-deep px-5 py-4 flex justify-between">
            <div>
              <div className="text-sm text-warmwhite">{item.product.title}</div>
              <div className="text-[12px] text-text-secondary">Qty {item.quantity}</div>
            </div>
            <div className="text-sm text-warmwhite">
              ₹{Number(item.price).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end gap-1.5 text-sm">
        <Row label="Subtotal" value={order.subtotal} />
        {Number(order.discountAmount) > 0 && (
          <Row label="Discount" value={-Number(order.discountAmount)} />
        )}
        <Row label="Shipping" value={order.shippingCharge} />
        <Row label="Tax (GST)" value={order.taxAmount} />
        <div className="flex gap-8 pt-2 mt-2 border-t border-line">
          <span className="text-text-secondary">Total</span>
          <span className="font-display text-xl text-champagne">
            ₹{Number(order.total).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | string | { toNumber(): number } }) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : value.toNumber();

  return (
    <div className="flex gap-8">
      <span className="text-text-secondary w-28 text-left">{label}</span>
      <span className="text-warmwhite w-24 text-right">
        ₹{numericValue.toLocaleString("en-IN")}
      </span>
    </div>
  );
}
