import Link from "next/link";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Payments — Admin" };

export default async function AdminPaymentsPage() {
  await requirePermission("order:read");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { order: { select: { id: true, orderNumber: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-2">Payments</h1>
      <p className="text-sm text-text-secondary mb-8">
        Read-only until Razorpay is wired in (Phase 6) — this will populate
        as real orders are placed.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Order</th>
              <th className="py-3 pr-4">Method</th>
              <th className="py-3 pr-4">Amount</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="py-3 pr-4">
                  <Link href={`/admin/orders/${p.order.id}`} className="text-champagne hover:underline">
                    {p.order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-text-secondary">{p.method ?? "—"}</td>
                <td className="py-3 pr-4 text-warmwhite">
                  ₹{Number(p.amount).toLocaleString("en-IN")}
                </td>
                <td className="py-3 pr-4 text-text-secondary">{p.status}</td>
                <td className="py-3 text-text-secondary">
                  {p.createdAt.toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="text-sm text-text-secondary mt-6">No payments yet.</p>}
      </div>
    </div>
  );
}
