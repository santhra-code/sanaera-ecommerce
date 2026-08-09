"use client";

import { useState } from "react";
import Link from "next/link";
import TextField from "./TextField";
import Button from "@/components/Button";
import { forgotPasswordAction } from "@/app/(auth)/actions";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await forgotPasswordAction({ email });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage(result.message ?? null);
    setSent(true);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-1">Reset your password</h1>
      <p className="text-sm text-text-secondary mb-8">
        Enter your email and we'll send you a reset link.
      </p>

      {sent ? (
        <p className="text-champagne text-[14px]">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full text-center block">
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="text-center text-[13px] text-text-secondary mt-8">
        <Link href="/login" className="text-champagne hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
