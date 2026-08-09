"use client";

import { useState } from "react";
import TextField from "@/components/auth/TextField";
import Button from "@/components/Button";
import { changePasswordSchema } from "@/lib/validations/auth";
import { changePasswordAction } from "@/app/(auth)/actions";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = changePasswordSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const result = await changePasswordAction(form);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage(result.message ?? "Password changed.");
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[420px]">
      <TextField
        label="Current Password"
        type="password"
        value={form.currentPassword}
        onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        autoComplete="current-password"
        required
      />
      <TextField
        label="New Password"
        type="password"
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        autoComplete="new-password"
        required
      />
      <TextField
        label="Confirm New Password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        autoComplete="new-password"
        required
      />

      {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}
      {message && <p className="text-champagne text-[13px] mb-5">{message}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Updating…" : "Change Password"}
      </Button>
    </form>
  );
}
