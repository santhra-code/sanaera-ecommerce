import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import CouponManager from "@/components/admin/CouponManager";

export const metadata = { title: "Coupons — Admin" };

export default async function AdminCouponsPage() {
  await requirePermission("coupon:write");

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const serialized = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value.toString(),
    usedCount: c.usedCount,
    usageLimit: c.usageLimit,
    isActive: c.isActive,
    expiresAt: c.expiresAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Coupons</h1>
      <CouponManager coupons={serialized} />
    </div>
  );
}
