"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-[12px] uppercase tracking-[0.1em] text-text-secondary hover:text-maroon transition-colors"
    >
      Sign Out
    </button>
  );
}
