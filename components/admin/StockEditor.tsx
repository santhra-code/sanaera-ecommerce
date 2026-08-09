"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStockAction } from "@/app/admin/inventory/actions";

export default function StockEditor({
  variantId,
  availableStock,
  lowStockThreshold,
}: {
  variantId: string;
  availableStock: number;
  lowStockThreshold: number;
}) {
  const router = useRouter();
  const [stock, setStock] = useState(availableStock);
  const [threshold, setThreshold] = useState(lowStockThreshold);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await updateStockAction(variantId, stock, threshold);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        className="w-16 bg-transparent border-b border-line text-[13px] text-warmwhite py-1 focus:outline-none focus:border-champagne"
      />
      <span className="text-text-secondary text-[11px]">low at</span>
      <input
        type="number"
        min={0}
        value={threshold}
        onChange={(e) => setThreshold(Number(e.target.value))}
        className="w-14 bg-transparent border-b border-line text-[13px] text-warmwhite py-1 focus:outline-none focus:border-champagne"
      />
      <button
        onClick={handleSave}
        disabled={loading}
        className="text-[11px] uppercase tracking-wide text-champagne hover:underline disabled:opacity-50 ml-1"
      >
        {loading ? "…" : "Save"}
      </button>
    </div>
  );
}
