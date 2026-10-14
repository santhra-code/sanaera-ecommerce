"use client";

import { useState, type FormEvent } from "react";
import { sendContactMessageAction } from "@/app/actions";

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const result = await sendContactMessageAction({
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
    });
    setBusy(false);
    if (result.success) {
      setSent(true);
      formElement.reset();
    } else {
      setError(result.error);
    }
  }

  if (sent) {
    return <p role="status" className="text-champagne">Thank you. Your message has been received.</p>;
  }

  const fieldClass = "w-full bg-emerald-deep border border-line px-4 py-3 text-sm text-warmwhite focus-visible:ring-2 focus-visible:ring-champagne";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" aria-busy={busy}>
      <label className="grid gap-2 text-sm text-sand">
        Name
        <input className={fieldClass} name="name" autoComplete="name" required minLength={2} maxLength={120} />
      </label>
      <label className="grid gap-2 text-sm text-sand">
        Email address
        <input className={fieldClass} name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <label className="grid gap-2 text-sm text-sand">
        Subject
        <input className={fieldClass} name="subject" required minLength={3} maxLength={160} />
      </label>
      <label className="grid gap-2 text-sm text-sand">
        Message
        <textarea className={`${fieldClass} min-h-36`} name="message" required minLength={10} maxLength={5000} />
      </label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="justify-self-start bg-champagne px-6 py-3 text-xs uppercase tracking-widest text-matte-black disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-warmwhite"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs text-text-secondary">We use these details only to respond to your enquiry.</p>
    </form>
  );
}