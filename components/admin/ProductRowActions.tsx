"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleProductStatusAction, deleteProductAction } from "@/app/admin/products/actions";

export default function ProductRowActions({
  productId,
  status,
}: {
  productId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleProductStatusAction(productId);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setLoading(true);
    await deleteProductAction(productId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={handleToggle}
        disabled={loading}
        className="text-[12px] text-champagne hover:underline disabled:opacity-50"
      >
        {status === "PUBLISHED" ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-[12px] text-maroon hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
