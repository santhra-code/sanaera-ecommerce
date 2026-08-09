"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeUserRoleAction } from "@/app/admin/admins/actions";
import type { RoleName } from "@prisma/client";

const ROLES: RoleName[] = ["SUPER_ADMIN", "PRODUCT_MANAGER", "ORDER_MANAGER", "CUSTOMER_SUPPORT", "CUSTOMER"];

export default function RoleSelect({ userId, role }: { userId: string; role: RoleName | "" }) {
  const router = useRouter();
  const [value, setValue] = useState<RoleName | "">(role);
  const [loading, setLoading] = useState(false);

  async function handleChange(next: RoleName) {
    if (!confirm(`Change this user's role to ${next.replace("_", " ")}?`)) return;
    setLoading(true);
    setValue(next);
    const result = await changeUserRoleAction(userId, next);
    setLoading(false);
    if (!result.success) {
      setValue(role);
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as RoleName)}
      className="bg-emerald border border-line text-[12px] uppercase tracking-wide text-warmwhite px-2.5 py-1.5 focus:outline-none focus:border-champagne disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r} className="bg-emerald-deep">
          {r.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
