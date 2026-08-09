"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { promoteByEmailAction } from "@/app/admin/admins/actions";
import type { RoleName } from "@prisma/client";
import Button from "@/components/Button";

const ROLES: RoleName[] = ["SUPER_ADMIN", "PRODUCT_MANAGER", "ORDER_MANAGER", "CUSTOMER_SUPPORT"];

export default function PromoteAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleName>("CUSTOMER_SUPPORT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await promoteByEmailAction(email, role);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEmail("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-deep p-6 max-w-[520px] flex flex-col gap-4">
      <div className="flex gap-4">
        <input
          type="email"
          placeholder="Existing account's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-transparent border-b border-line py-2.5 text-[14px] text-warmwhite placeholder:text-text-secondary/50 focus:outline-none focus:border-champagne"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as RoleName)}
          className="bg-transparent border-b border-line text-[13px] text-warmwhite focus:outline-none focus:border-champagne"
        >
          {ROLES.map((r) => (
            <option key={r} value={r} className="bg-emerald-deep">
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-maroon text-[13px]">{error}</p>}
      <Button type="submit" disabled={loading} className="self-start">
        {loading ? "Granting…" : "Grant Admin Access"}
      </Button>
      <p className="text-[11px] text-text-secondary">
        The person must already have a SANAÉRA account (customer signup) —
        this only changes their role, it doesn't create an account.
      </p>
    </form>
  );
}
