import Link from "next/link";
import { requireAdminTier } from "@/lib/require-admin";
import SignOutButton from "@/components/auth/SignOutButton";
import type { PermissionKey } from "@/lib/rbac";

const NAV: { href: string; label: string; permission: PermissionKey | null }[] = [
  { href: "/admin", label: "Dashboard", permission: null },
  { href: "/admin/orders", label: "Orders", permission: "order:read" },
  { href: "/admin/products", label: "Products", permission: "product:read" },
  { href: "/admin/categories", label: "Categories", permission: "category:write" },
  { href: "/admin/collections", label: "Collections", permission: "collection:write" },
  { href: "/admin/customers", label: "Customers", permission: "customer:read" },
  { href: "/admin/inventory", label: "Inventory", permission: "inventory:read" },
  { href: "/admin/coupons", label: "Coupons", permission: "coupon:write" },
  { href: "/admin/banners", label: "Banners", permission: "banner:write" },
  { href: "/admin/homepage", label: "Homepage Editor", permission: "homepage:write" },
  { href: "/admin/reviews", label: "Reviews", permission: "review:moderate" },
  { href: "/admin/returns", label: "Returns", permission: "order:refund" },
  { href: "/admin/payments", label: "Payments", permission: "order:read" },
  { href: "/admin/shipping", label: "Shipping", permission: "order:read" },
  { href: "/admin/reports", label: "Reports", permission: "analytics:read" },
  { href: "/admin/admins", label: "Admins & Roles", permission: "admin:manage_roles" },
  { href: "/admin/audit-logs", label: "Audit Logs", permission: "admin:view_audit_log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminTier();
  const permissions = new Set(user.permissions ?? []);
  const visibleNav = NAV.filter((item) => item.permission === null || permissions.has(item.permission));

  return (
    <div className="min-h-screen bg-matte-black">
      <div className="grid md:grid-cols-[230px_1fr] min-h-screen">
        <aside className="bg-emerald-deep border-r border-line px-6 py-8">
          <Link href="/admin" className="font-display text-xl tracking-[0.25em] text-warmwhite block mb-1">
            SANAÉRA
          </Link>
          <div className="text-[10.5px] uppercase tracking-wide text-champagne mb-8">
            Admin · {user.role?.replace("_", " ")}
          </div>
          <nav className="flex flex-col gap-0.5">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] py-2 px-2.5 -mx-2.5 text-text-secondary hover:text-champagne hover:bg-emerald transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 pt-6 border-t border-line flex flex-col gap-3">
            <Link href="/" className="text-[12px] text-text-secondary hover:text-champagne">
              ← Back to storefront
            </Link>
            <SignOutButton />
          </div>
        </aside>
        <main className="px-8 py-10 md:px-12 md:py-12">{children}</main>
      </div>
    </div>
  );
}
