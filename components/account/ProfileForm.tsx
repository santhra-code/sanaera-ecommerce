"use client";

import { useState } from "react";
import TextField from "@/components/auth/TextField";
import Button from "@/components/Button";
import { profileSchema } from "@/lib/validations/account";
import { updateProfileAction } from "@/app/account/actions";

export default function ProfileForm({
  initial,
}: {
  initial: { firstName: string; lastName: string; phone: string };
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const result = await updateProfileAction(parsed.data);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage(result.message ?? "Saved.");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[420px]">
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />
        <TextField
          label="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />
      </div>
      <TextField
        label="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}
      {message && <p className="text-champagne text-[13px] mb-5">{message}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
