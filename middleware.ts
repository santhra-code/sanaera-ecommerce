import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { permissionRequiredFor } from "@/lib/rbac";

// Deliberately a SEPARATE NextAuth instance from lib/auth.ts — this one is
// built only from the edge-safe authConfig (no Prisma adapter, no
// Credentials/Google providers), so it can run in the Edge Runtime that
// middleware uses by default. It only ever *decodes* the session cookie
// that the full instance (lib/auth.ts, running in Node.js route handlers)
// already minted — it never itself signs anyone in.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return;
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = req.auth?.user?.role;
    const permissions = req.auth?.user?.permissions ?? [];
    const isAdminTier = Boolean(role) && role !== "CUSTOMER";
    if (!isAdminTier) {
      return NextResponse.redirect(new URL("/403", req.nextUrl.origin));
    }

    const required = permissionRequiredFor(pathname);
    if (required && !permissions.includes(required)) {
      return NextResponse.redirect(new URL("/403", req.nextUrl.origin));
    }
    // No specific permission required (e.g. /admin, /admin/analytics) —
    // any admin-tier role may proceed.
    return;
  }
});

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
