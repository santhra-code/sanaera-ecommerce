"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartItemControls({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateQuantity(next: number) {
    setLoading(true);
    if (next <= 0) {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    } else {
      await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: next }),
      });
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => updateQuantity(quantity - 1)}
        disabled={loading}
        className="w-7 h-7 border border-line text-warmwhite hover:border-champagne transition-colors disabled:opacity-50"
      >
        −
      </button>
      <span className="text-sm text-warmwhite w-4 text-center">{quantity}</span>
      <button
        onClick={() => updateQuantity(quantity + 1)}
        disabled={loading}
        className="w-7 h-7 border border-line text-warmwhite hover:border-champagne transition-colors disabled:opacity-50"
      >
        +
      </button>
      <button
        onClick={() => updateQuantity(0)}
        disabled={loading}
        className="text-[11px] uppercase tracking-wide text-text-secondary hover:text-maroon transition-colors ml-3 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
