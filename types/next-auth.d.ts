import type { DefaultSession } from "next-auth";
import type { RoleName } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleName;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    role?: RoleName;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: RoleName;
    permissions?: string[];
    effectiveExp?: number;
  }
}
