"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "./TextField";
import Button from "@/components/Button";
import { resetPasswordAction } from "@/app/(auth)/actions";

export default function ResetPasswordForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !token) {
      setError("This reset link is invalid. Request a new one.");
      return;
    }

    setLoading(true);
    const result = await resetPasswordAction({ email, token, password, confirmPassword });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/login?reset=1");
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-1">Set a new password</h1>
      <p className="text-sm text-text-secondary mb-8">
        Choose a new password for <span className="text-warmwhite">{email}</span>.
      </p>

      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <TextField
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full text-center block">
          {loading ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
