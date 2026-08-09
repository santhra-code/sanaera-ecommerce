"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "./TextField";
import Button from "@/components/Button";
import { verifyOtpAction, requestOtpAction } from "@/app/(auth)/actions";

export default function OtpForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await verifyOtpAction({ email, code });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/login?verified=1");
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    setNotice(null);
    const result = await requestOtpAction(email);
    setResending(false);
    setNotice(result.success ? result.message ?? "New code sent." : result.error);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-1">Verify your email</h1>
      <p className="text-sm text-text-secondary mb-8">
        We sent a 6-digit code to <span className="text-warmwhite">{email}</span>.
      </p>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Verification Code"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />

        {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}
        {notice && <p className="text-champagne text-[13px] mb-5">{notice}</p>}

        <Button type="submit" disabled={loading} className="w-full text-center block">
          {loading ? "Verifying…" : "Verify Email"}
        </Button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending}
        className="w-full text-center text-[13px] text-text-secondary hover:text-champagne mt-6 disabled:opacity-50"
      >
        {resending ? "Sending…" : "Didn't get a code? Resend"}
      </button>
    </div>
  );
}
