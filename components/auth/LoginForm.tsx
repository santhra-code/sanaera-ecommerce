"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import TextField from "./TextField";
import Button from "@/components/Button";
import { loginSchema } from "@/lib/validations/auth";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password, rememberMe });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      rememberMe: String(rememberMe),
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "TOO_MANY_ATTEMPTS"
          ? "Too many attempts. Try again in a minute."
          : result.error === "ACCOUNT_DISABLED"
          ? "This account has been disabled. Contact support."
          : "Incorrect email or password."
      );
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-1">Welcome back</h1>
      <p className="text-sm text-text-secondary mb-8">Sign in to your SANAÉRA account.</p>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <div className="flex justify-between items-center mb-7 text-[12.5px]">
          <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-champagne"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-champagne hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-maroon text-[13px] mb-5">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full text-center block">
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-7 text-[11px] uppercase tracking-[0.1em] text-text-secondary">
        <span className="flex-1 h-px bg-line" /> or <span className="flex-1 h-px bg-line" />
      </div>

      <Button
        variant="ghost"
        className="w-full text-center block"
        onClick={() => signIn("google", { callbackUrl: "/account" })}
      >
        Continue with Google
      </Button>

      <p className="text-center text-[13px] text-text-secondary mt-8">
        New to SANAÉRA?{" "}
        <Link href="/register" className="text-champagne hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
