import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { ROLE_PERMISSIONS } from "@/lib/rbac";
import { authConfig, REMEMBER_ME_MAX_AGE, DEFAULT_SESSION_MAX_AGE } from "@/lib/auth.config";
import type { RoleName } from "@prisma/client";

// The full, Node.js-only Auth.js instance: Prisma adapter + both providers +
// bcrypt-backed Credentials + the DB-dependent parts of jwt/signIn. Only
// ever imported from Route Handlers and Server Components. middleware.ts
// deliberately does NOT import this file — see lib/auth.config.ts and its
// own middleware-only NextAuth instance for why.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" }, // "true" | "false", stringified
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse({
          email: raw?.email,
          password: raw?.password,
          rememberMe: raw?.rememberMe === "true",
        });
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL ?? "dev-admin@example.com";
        const DEV_ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD ?? "devadmin";
        const DEV_ADMIN_BYPASS_ENABLED =
          process.env.NODE_ENV !== "production" || process.env.DEV_ADMIN_LOGIN === "true";

        if (DEV_ADMIN_BYPASS_ENABLED && email === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD) {
          let role = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
          if (!role) {
            role = await prisma.role.create({
              data: { name: "SUPER_ADMIN", description: "Development admin role" },
            });
          }

          let user = await prisma.user.findUnique({
            where: { email: DEV_ADMIN_EMAIL },
            include: { role: true },
          });

          const hashedPassword = await hashPassword(DEV_ADMIN_PASSWORD);
          if (!user) {
            user = await prisma.user.create({
              data: {
                firstName: "Dev",
                lastName: "Admin",
                email: DEV_ADMIN_EMAIL,
                passwordHash: hashedPassword,
                roleId: role.id,
                isVerified: true,
                emailVerified: new Date(),
                isActive: true,
              },
              include: { role: true },
            });
          } else {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                passwordHash: user.passwordHash || hashedPassword,
                roleId: role.id,
                isVerified: true,
                emailVerified: user.emailVerified ?? new Date(),
                isActive: true,
              },
              include: { role: true },
            });
          }

          await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            image: user.image,
            role: user.role?.name ?? "SUPER_ADMIN",
            rememberMe: parsed.data.rememberMe,
          };
        }

        const { limited } = await checkRateLimit("login", `login:${email}`);
        if (limited) throw new Error("TOO_MANY_ATTEMPTS");

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });
        // No user, no password set (OAuth-only account), or bad password —
        // all return null identically so we don't leak which case it was.
        if (!user || !user.passwordHash) return null;
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        if (!user.isActive) throw new Error("ACCOUNT_DISABLED");

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
          role: user.role?.name ?? "CUSTOMER",
          rememberMe: parsed.data.rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks, // the edge-safe `session` callback
    async signIn({ user, account }) {
      // Google sign-ins land here too. First-time Google users get a User
      // row via the Prisma adapter automatically, with roleId left null
      // (see the schema comment) — assign CUSTOMER right away.
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing && !existing.roleId) {
          const customerRole = await prisma.role.findUniqueOrThrow({
            where: { name: "CUSTOMER" },
          });
          await prisma.user.update({
            where: { id: existing.id },
            data: { roleId: customerRole.id, isVerified: true, emailVerified: new Date() },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role;
        const rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? true;
        // Encode an effective expiry shorter than the cookie's own maxAge
        // when the user didn't ask to be remembered — see auth.config.ts's
        // session callback, which enforces this.
        token.effectiveExp = Math.floor(Date.now() / 1000) +
          (rememberMe ? REMEMBER_ME_MAX_AGE : DEFAULT_SESSION_MAX_AGE);
      }

      // The Google provider's `user` object has no `role` (the Prisma
      // adapter doesn't know about our custom relation). The signIn
      // callback above backfills roleId in the DB but that doesn't flow
      // back onto this in-memory `user` object, so on first Google sign-in
      // — and as a safety net for any older token minted before this field
      // existed — look the role up directly. This is safe here (unlike in
      // middleware) because this file only runs in the Node.js runtime.
      if (!token.role && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: { select: { name: true } } },
        });
        token.role = dbUser?.role?.name ?? "CUSTOMER";
      }
      token.permissions = ROLE_PERMISSIONS[(token.role as RoleName) ?? "CUSTOMER"];

      // Let profile edits (Phase 3) refresh the session without re-login.
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.picture = session.image ?? token.picture;
      }
      return token;
    },
  },
});
