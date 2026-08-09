"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveWishlistItemButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    await fetch(`/api/wishlist/${itemId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-[11px] uppercase tracking-wide text-text-secondary hover:text-maroon transition-colors disabled:opacity-50"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}
