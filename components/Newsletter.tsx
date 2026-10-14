"use client";

import { useState } from "react";
import { subscribeNewsletterAction } from "@/app/actions";
import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setError("");
    const result = await subscribeNewsletterAction({ email });
    if (result.success) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
      setError(result.error);
    }
  };

  return (
    <section id="newsletter" className="px-12 py-[120px] text-center bg-ivory max-md:px-6 max-md:py-20" aria-label="Newsletter Subscription">
      <Reveal>
        <Eyebrow className="block mb-4">The Inner Circle</Eyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display font-normal italic text-[clamp(30px,4vw,50px)] mb-5 text-warmwhite">
          Join the loyalty circle.
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-text-secondary text-sm mb-10 max-w-lg mx-auto leading-relaxed">
          Early access to limited editions, private trunk shows, and bridal appointments —
          reserved for members.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        {status === "success" ? (
          <div
            role="status"
            aria-live="polite"
            className="text-champagne font-display text-lg py-3"
          >
            ✦ You&apos;re on the list. We&apos;ll be in touch.
          </div>
        ) : (
          <form
            className="flex max-w-[480px] mx-auto border-b border-champagne pb-3 gap-2"
            onSubmit={handleSubmit}
            aria-busy={status === "submitting"}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              disabled={status === "submitting"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-transparent font-body text-sm outline-none tracking-[0.02em] text-warmwhite placeholder:text-text-secondary focus-visible:ring-1 focus-visible:ring-champagne px-1"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="font-label text-[11px] tracking-[0.16em] uppercase text-champagne hover:text-warmwhite transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-champagne"
            >
              {status === "submitting" ? "Joining…" : "Subscribe →"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p role="alert" className="text-sm text-red-700 mt-4">
            {error}
          </p>
        )}
      </Reveal>
    </section>
  );
}
