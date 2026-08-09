"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { moderateReviewAction } from "@/app/admin/reviews/actions";

export default function ReviewModerationControls({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function handle(status: "APPROVED" | "REJECTED") {
    setLoading(status);
    const result = await moderateReviewAction(reviewId, status);
    setLoading(null);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => handle("APPROVED")}
        disabled={loading !== null}
        className="text-[11px] uppercase tracking-wide text-champagne hover:underline disabled:opacity-50"
      >
        {loading === "APPROVED" ? "Approving…" : "Approve"}
      </button>
      <button
        onClick={() => handle("REJECTED")}
        disabled={loading !== null}
        className="text-[11px] uppercase tracking-wide text-maroon hover:underline disabled:opacity-50"
      >
        {loading === "REJECTED" ? "Rejecting…" : "Reject"}
      </button>
    </div>
  );
}
