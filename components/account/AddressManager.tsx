"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@/components/auth/TextField";
import Button from "@/components/Button";
import { addressSchema } from "@/lib/validations/account";

type Address = {
  id: string;
  type: "BILLING" | "SHIPPING";
  isDefault: boolean;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const EMPTY_FORM: Omit<Address, "id"> = {
  type: "SHIPPING",
  isDefault: false,
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function AddressManager({
  addresses,
}: {
  addresses: Address[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function startEdit(addr: Address) {
    setForm({ ...addr, line2: addr.line2 ?? "" });
    setEditingId(addr.id);
    setError(null);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const res = await fetch(editingId ? `/api/addresses/${editingId}` : "/api/addresses", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong.");
      return;
    }
    setShowForm(false);
    router.refresh();
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-px bg-line mb-8">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-emerald-deep p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10.5px] uppercase tracking-wide text-champagne">
                {addr.type} {addr.isDefault && "· Default"}
              </span>
            </div>
            <p className="text-sm text-warmwhite leading-relaxed">
              {addr.fullName}
              <br />
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {addr.city}, {addr.state} {addr.postalCode}
              <br />
              {addr.phone}
            </p>
            <div className="flex gap-4 mt-3">
              <button
                onClick={() => startEdit(addr)}
                className="text-[11px] uppercase tracking-wide text-text-secondary hover:text-champagne"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-[11px] uppercase tracking-wide text-text-secondary hover:text-maroon"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showForm && (
        <Button variant="ghost" onClick={startAdd}>
          + Add Address
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-emerald-deep p-6 max-w-[480px]">
          <div className="grid grid-cols-2 gap-4">
            <label className="block mb-5 col-span-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-text-secondary block mb-2">
                Address Type
              </span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "BILLING" | "SHIPPING" })}
                className="w-full bg-transparent border-b border-line py-2.5 text-[14px] text-warmwhite focus:outline-none focus:border-champagne"
              >
                <option className="bg-emerald-deep" value="SHIPPING">Shipping</option>
                <option className="bg-emerald-deep" value="BILLING">Billing</option>
              </select>
            </label>
          </div>
          <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <TextField label="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
          <TextField label="Address Line 2 (optional)" value={form.line2 ?? ""} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <TextField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Postal Code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
            <TextField label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-text-secondary mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="accent-champagne"
            />
            Set as default {form.type.toLowerCase()} address
          </label>

          {error && <p className="text-maroon text-[13px] mb-4">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : editingId ? "Save Changes" : "Add Address"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
