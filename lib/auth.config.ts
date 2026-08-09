import type { NextAuthConfig } from "next-auth";

// Ceiling for the JWT session cookie itself. The *effective* expiry when
// "remember me" is unchecked is enforced via a custom `effectiveExp` claim
// (set in the full config's jwt callback, checked in `session` below), since
// Auth.js's `session.maxAge` is one static value that can't vary per sign-in.
export const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24; // 1 day

/**
 * Deliberately has NO Prisma, bcrypt, or provider imports — this file (and
 * everything it imports) must stay Edge-Runtime-safe because middleware.ts
 * builds a NextAuth instance from this config directly. All the DB-backed
 * logic (Credentials/Google providers, the Prisma adapter, role backfill on
 * first Google sign-in) lives in lib/auth.ts instead, which is only ever
 * imported from Route Handlers and Server Components — both Node.js runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt", maxAge: REMEMBER_ME_MAX_AGE },
  providers: [], // real providers are added only in the full config (lib/auth.ts)
  callbacks: {
    async session({ session, token }) {
      if (token.effectiveExp && Date.now() / 1000 > (token.effectiveExp as number)) {
        // Effective session has expired even though the JWT cookie hasn't —
        // treat as logged out.
        return null as unknown as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { permissions?: string[] }).permissions =
          (token.permissions as string[]) ?? [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
