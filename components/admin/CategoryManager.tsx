"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { createCategoryAction, deleteCategoryAction } from "@/app/admin/categories/actions";

export default function CategoryManager({
  categories,
}: {
  categories: { id: string; name: string; slug: string; _count: { products: number } }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createCategoryAction(name);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const result = await deleteCategoryAction(id);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-3 mb-8 max-w-[420px]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 bg-transparent border-b border-line text-[14px] text-warmwhite py-2 focus:outline-none focus:border-champagne"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Adding…" : "Add"}
        </Button>
      </form>
      {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}

      <div className="flex flex-col gap-px bg-line">
        {categories.map((c) => (
          <div key={c.id} className="bg-emerald-deep px-5 py-3 flex justify-between items-center">
            <span className="text-sm text-warmwhite">
              {c.name} <span className="text-text-secondary text-[12px]">({c._count.products} products)</span>
            </span>
            <button
              onClick={() => handleDelete(c.id)}
              className="text-[12px] text-maroon hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
