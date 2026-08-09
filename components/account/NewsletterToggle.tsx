"use client";

import { useState } from "react";
import { toggleNewsletterAction } from "@/app/account/actions";

export default function NewsletterToggle({ initialSubscribed }: { initialSubscribed: boolean }) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const next = !subscribed;
    await toggleNewsletterAction(next);
    setSubscribed(next);
    setLoading(false);
  }

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={subscribed}
        onChange={handleToggle}
        disabled={loading}
        className="accent-champagne"
      />
      <span className="text-sm text-warmwhite">
        Email me about new collections and offers
      </span>
    </label>
  );
}
