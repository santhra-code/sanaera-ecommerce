import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import ReviewModerationControls from "@/components/admin/ReviewModerationControls";

export const metadata = { title: "Reviews — Admin" };

export default async function AdminReviewsPage() {
  await requirePermission("review:moderate");

  const [pending, recentlyModerated] = await Promise.all([
    prisma.review.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        product: { select: { title: true, slug: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.review.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        product: { select: { title: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-2">Reviews</h1>
      <p className="text-sm text-text-secondary mb-10">
        {pending.length} awaiting moderation. Only verified-purchase reviews reach this queue.
      </p>

      <div className="flex flex-col gap-px bg-line mb-14">
        {pending.length === 0 && (
          <p className="text-sm text-text-secondary bg-emerald-deep p-5">Queue is empty.</p>
        )}
        {pending.map((r) => (
          <div key={r.id} className="bg-emerald-deep p-5">
            <div className="flex justify-between items-start mb-2 gap-6">
              <div>
                <div className="text-sm text-warmwhite">{r.product.title}</div>
                <div className="text-[11px] text-text-secondary">
                  {r.user.firstName} {r.user.lastName} · {r.user.email}
                  {r.isVerifiedPurchase && (
                    <span className="text-champagne"> · Verified Purchase</span>
                  )}
                </div>
              </div>
              <span className="text-champagne tracking-[2px] text-sm whitespace-nowrap">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </span>
            </div>
            {r.title && <div className="text-sm text-warmwhite mb-1">{r.title}</div>}
            <p className="text-[13px] text-text-secondary leading-relaxed mb-3">{r.body}</p>
            <ReviewModerationControls reviewId={r.id} />
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl text-warmwhite mb-4">Recently Moderated</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Product</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Rating</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentlyModerated.map((r) => (
              <tr key={r.id} className="border-b border-line">
                <td className="py-3 pr-4 text-warmwhite">{r.product.title}</td>
                <td className="py-3 pr-4 text-text-secondary">
                  {r.user.firstName} {r.user.lastName}
                </td>
                <td className="py-3 pr-4 text-champagne">{r.rating}★</td>
                <td className={`py-3 ${r.status === "APPROVED" ? "text-champagne" : "text-maroon"}`}>
                  {r.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentlyModerated.length === 0 && (
          <p className="text-sm text-text-secondary mt-4">Nothing moderated yet.</p>
        )}
      </div>
    </div>
  );
}
