import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { PermissionKey } from "@/lib/rbac";

/**
 * Middleware keeps people who obviously shouldn't be here from ever loading
 * the page (good UX, fewer wasted renders). This is the actual security
 * boundary: every admin Server Component and Server Action calls this (or
 * `requireAdminTier`) itself, so a middleware bug/bypass can't alone grant
 * access to a mutation.
 */
export async function requirePermission(permission: PermissionKey) {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/admin`);
  if (!session.user.permissions?.includes(permission)) redirect("/403");
  return session.user;
}

/** For pages any admin-tier role may see (the dashboard overview, analytics). */
export async function requireAdminTier() {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/admin`);
  if (session.user.role === "CUSTOMER") redirect("/403");
  return session.user;
}
