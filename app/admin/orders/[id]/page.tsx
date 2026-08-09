import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import TrackingForm from "@/components/admin/TrackingForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("order:read");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      items: { include: { product: { select: { title: true } } } },
      payment: true,
      billingAddress: true,
      shippingAddress: true,
      returnRequests: true,
    },
  });
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-[12px] text-champagne hover:underline">
        ← Back to orders
      </Link>

      <div className="flex justify-between items-start mt-4 mb-10">
        <div>
          <h1 className="font-display text-3xl text-warmwhite">{order.orderNumber}</h1>
          <p className="text-[13px] text-text-secondary mt-1">
            {order.user.firstName} {order.user.lastName} · {order.user.email}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <InfoCard title="Shipping Address">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          <br />
          {order.shippingAddress.phone}
        </InfoCard>
        <InfoCard title="Payment">
          {order.payment?.method ?? "—"} · {order.payment?.status ?? "PENDING"}
          <br />
          ₹{Number(order.payment?.amount ?? order.total).toLocaleString("en-IN")}
          {Number(order.payment?.refundedAmount ?? 0) > 0 && (
            <div className="text-maroon mt-1">
              Refunded: ₹{Number(order.payment!.refundedAmount).toLocaleString("en-IN")}
            </div>
          )}
        </InfoCard>
        <InfoCard title="Tracking">
          <TrackingForm
            orderId={order.id}
            trackingNumber={order.trackingNumber ?? ""}
            trackingCarrier={order.trackingCarrier ?? ""}
          />
        </InfoCard>
      </div>

      <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-3">Items</h3>
      <div className="flex flex-col gap-px bg-line mb-8">
        {order.items.map((item) => (
          <div key={item.id} className="bg-emerald-deep px-5 py-3 flex justify-between">
            <span className="text-sm text-warmwhite">
              {item.product.title} × {item.quantity}
            </span>
            <span className="text-sm text-warmwhite">
              ₹{Number(item.price).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      {order.returnRequests.length > 0 && (
        <>
          <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-3">
            Return Requests
          </h3>
          <div className="flex flex-col gap-px bg-line mb-8">
            {order.returnRequests.map((r) => (
              <Link
                key={r.id}
                href="/admin/returns"
                className="bg-emerald-deep px-5 py-3 flex justify-between hover:bg-emerald transition-colors"
              >
                <span className="text-sm text-warmwhite">{r.reason}</span>
                <span className="text-[12px] text-champagne">{r.status}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="text-right font-display text-xl text-champagne">
        Total: ₹{Number(order.total).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-emerald-deep p-5">
      <h3 className="text-[10.5px] uppercase tracking-[0.1em] text-text-secondary mb-2.5">
        {title}
      </h3>
      <div className="text-[13px] text-warmwhite leading-relaxed">{children}</div>
    </div>
  );
}
