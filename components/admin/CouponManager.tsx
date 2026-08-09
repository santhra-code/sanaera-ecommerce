"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import {
  createCouponAction,
  toggleCouponActiveAction,
  deleteCouponAction,
} from "@/app/admin/coupons/actions";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FLAT";
  value: string;
  usedCount: number;
  usageLimit: number | null;
  isActive: boolean;
  expiresAt: string | null;
};

type CouponFormState = {
  code: string;
  type: "PERCENTAGE" | "FLAT";
  value: string;
  minPurchase: string;
  usageLimit: string;
  perUserLimit: string;
  expiresAt: string;
};

const EMPTY: CouponFormState = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minPurchase: "",
  usageLimit: "",
  perUserLimit: "1",
  expiresAt: "",
};

export default function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createCouponAction({
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      perUserLimit: Number(form.perUserLimit || 1),
      expiresAt: form.expiresAt || undefined,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setForm(EMPTY);
    setShowForm(false);
    router.refresh();
  }

  async function handleToggle(id: string) {
    await toggleCouponActiveAction(id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await deleteCouponAction(id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-px bg-line mb-8">
        {coupons.map((c) => (
          <div key={c.id} className="bg-emerald-deep px-5 py-3 flex justify-between items-center">
            <div>
              <span className="text-sm text-warmwhite font-mono">{c.code}</span>
              <span className="text-[12px] text-text-secondary ml-3">
                {c.type === "PERCENTAGE" ? `${c.value}% off` : `₹${c.value} off`} · used {c.usedCount}
                {c.usageLimit ? `/${c.usageLimit}` : ""}
              </span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleToggle(c.id)} className="text-[12px] text-champagne hover:underline">
                {c.isActive ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-[12px] text-maroon hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-sm text-text-secondary py-4">No coupons yet.</p>}
      </div>

      {!showForm && <Button onClick={() => setShowForm(true)}>+ New Coupon</Button>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-emerald-deep p-6 max-w-[420px]">
          <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
          <label className="block mb-5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-text-secondary block mb-2">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FLAT" })}
              className="w-full bg-transparent border-b border-line py-2.5 text-[14px] text-warmwhite focus:outline-none focus:border-champagne"
            >
              <option className="bg-emerald-deep" value="PERCENTAGE">Percentage</option>
              <option className="bg-emerald-deep" value="FLAT">Flat Amount</option>
            </select>
          </label>
          <Field label="Value" type="number" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />
          <Field label="Min Purchase (optional)" type="number" value={form.minPurchase} onChange={(v) => setForm({ ...form, minPurchase: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Usage Limit (optional)" type="number" value={form.usageLimit} onChange={(v) => setForm({ ...form, usageLimit: v })} />
            <Field label="Per-User Limit" type="number" value={form.perUserLimit} onChange={(v) => setForm({ ...form, perUserLimit: v })} />
          </div>
          <Field label="Expires (optional)" type="date" value={form.expiresAt} onChange={(v) => setForm({ ...form, expiresAt: v })} />

          {error && <p className="text-maroon text-[13px] mb-4">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Coupon"}</Button>
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block mb-5">
      <span className="text-[11px] uppercase tracking-[0.12em] text-text-secondary block mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-line py-2.5 text-[14px] text-warmwhite focus:outline-none focus:border-champagne"
      />
    </label>
  );
}
