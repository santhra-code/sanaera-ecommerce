"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TextField from "./TextField";
import Button from "@/components/Button";
import { registerSchema } from "@/lib/validations/auth";
import { registerAction } from "@/app/(auth)/actions";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const result = await registerAction(parsed.data);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-1">Create your account</h1>
      <p className="text-sm text-text-secondary mb-8">
        Join the SANAÉRA inner circle.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="First Name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />
          <TextField
            label="Last Name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
        </div>
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          autoComplete="email"
          required
        />
        <TextField
          label="Phone (optional)"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          autoComplete="new-password"
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full text-center block mt-2">
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-text-secondary mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-champagne hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
