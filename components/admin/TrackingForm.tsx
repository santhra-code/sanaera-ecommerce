"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTrackingAction } from "@/app/admin/orders/actions";

export default function TrackingForm({
  orderId,
  trackingNumber,
  trackingCarrier,
}: {
  orderId: string;
  trackingNumber: string;
  trackingCarrier: string;
}) {
  const router = useRouter();
  const [number, setNumber] = useState(trackingNumber);
  const [carrier, setCarrier] = useState(trackingCarrier);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await updateTrackingAction(orderId, { trackingNumber: number, trackingCarrier: carrier });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        placeholder="Carrier"
        className="bg-transparent border-b border-line text-[13px] text-warmwhite py-1 focus:outline-none focus:border-champagne"
      />
      <input
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Tracking number"
        className="bg-transparent border-b border-line text-[13px] text-warmwhite py-1 focus:outline-none focus:border-champagne"
      />
      <button
        onClick={handleSave}
        disabled={loading}
        className="text-[11px] uppercase tracking-wide text-champagne hover:underline text-left mt-1 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
