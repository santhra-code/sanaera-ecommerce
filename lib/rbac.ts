import type { RoleName } from "@prisma/client";

export const PERMISSIONS = [
  "product:read", "product:write", "product:delete",
  "category:write", "collection:write",
  "order:read", "order:update_status", "order:refund",
  "customer:read", "customer:write",
  "inventory:read", "inventory:write",
  "coupon:write",
  "review:moderate",
  "banner:write", "homepage:write",
  "admin:manage_roles", "admin:view_audit_log",
  "analytics:read",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<RoleName, PermissionKey[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  PRODUCT_MANAGER: [
    "product:read", "product:write", "product:delete",
    "category:write", "collection:write",
    "inventory:read", "inventory:write",
    "banner:write", "homepage:write",
  ],
  ORDER_MANAGER: [
    "order:read", "order:update_status", "order:refund",
    "inventory:read", "customer:read", "coupon:write",
  ],
  CUSTOMER_SUPPORT: [
    "customer:read", "order:read", "review:moderate",
  ],
  CUSTOMER: [],
};

/** The five roles that should ever see /admin at all (everyone except plain customers). */
export const ADMIN_TIER_ROLES: RoleName[] = [
  "SUPER_ADMIN",
  "PRODUCT_MANAGER",
  "ORDER_MANAGER",
  "CUSTOMER_SUPPORT",
];

export function roleHasPermission(role: RoleName, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Maps an /admin/* path prefix to the permission required to view it.
 * Checked in middleware (via the JWT's embedded permission list — see
 * lib/auth.ts) AND re-checked inside each page/action, since middleware is
 * a UX convenience, not the security boundary by itself.
 */
export const ADMIN_ROUTE_PERMISSIONS: { prefix: string; permission: PermissionKey }[] = [
  { prefix: "/admin/products", permission: "product:read" },
  { prefix: "/admin/categories", permission: "category:write" },
  { prefix: "/admin/collections", permission: "collection:write" },
  { prefix: "/admin/inventory", permission: "inventory:read" },
  { prefix: "/admin/orders", permission: "order:read" },
  { prefix: "/admin/returns", permission: "order:refund" },
  { prefix: "/admin/payments", permission: "order:read" },
  { prefix: "/admin/shipping", permission: "order:read" },
  { prefix: "/admin/customers", permission: "customer:read" },
  { prefix: "/admin/coupons", permission: "coupon:write" },
  { prefix: "/admin/reviews", permission: "review:moderate" },
  { prefix: "/admin/banners", permission: "banner:write" },
  { prefix: "/admin/homepage", permission: "homepage:write" },
  { prefix: "/admin/reports", permission: "analytics:read" },
  { prefix: "/admin/admins", permission: "admin:manage_roles" },
  { prefix: "/admin/audit-logs", permission: "admin:view_audit_log" },
  // /admin and /admin/analytics have no specific permission — any admin-tier
  // role may see the dashboard overview.
];

export function permissionRequiredFor(pathname: string): PermissionKey | null {
  const match = ADMIN_ROUTE_PERMISSIONS
    .filter((r) => pathname.startsWith(r.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]; // longest prefix wins
  return match?.permission ?? null;
}
