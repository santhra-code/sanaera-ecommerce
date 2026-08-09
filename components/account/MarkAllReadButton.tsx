"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsReadAction } from "@/app/account/actions";

export default function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await markAllNotificationsReadAction();
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-[12px] text-champagne hover:underline disabled:opacity-50"
    >
      {loading ? "Marking…" : "Mark all as read"}
    </button>
  );
}
