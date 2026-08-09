"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";

const STATUSES = [
  "PENDING", "CONFIRMED", "PACKING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED",
] as const;

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);

  async function handleChange(next: string) {
    setLoading(true);
    setValue(next);
    const result = await updateOrderStatusAction(orderId, next as (typeof STATUSES)[number]);
    setLoading(false);
    if (!result.success) {
      setValue(status); // revert
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-emerald border border-line text-[12px] uppercase tracking-wide text-warmwhite px-2.5 py-1.5 focus:outline-none focus:border-champagne disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-emerald-deep">
          {s}
        </option>
      ))}
    </select>
  );
}
