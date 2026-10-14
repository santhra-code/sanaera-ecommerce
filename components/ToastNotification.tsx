"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useShop } from "./ShopContext";

export default function ToastNotification() {
  const { toast, hideToast } = useShop();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#2D0C1C] border border-[#DEB092]/50 shadow-2xl rounded-none p-4 text-warmwhite flex items-center gap-4 backdrop-blur-md">
        {toast.image ? (
          <img
            src={toast.image}
            alt={toast.title}
            className="w-12 h-16 object-cover border border-[#DEB092]/30 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-16 bg-[#1a0610] border border-[#DEB092]/30 flex items-center justify-center text-[#DEB092] flex-shrink-0">
            {toast.type === "cart" ? "🛍️" : "♥"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-label uppercase tracking-[0.14em] text-[#DEB092]">
              {toast.title}
            </span>
            <button
              onClick={hideToast}
              className="text-[#DEB092]/60 hover:text-[#DEB092] text-xs p-1"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-warmwhite truncate font-normal mt-0.5">{toast.message}</p>
          {toast.href && (
            <Link
              href={toast.href}
              onClick={hideToast}
              className="inline-block text-[11px] uppercase tracking-[0.1em] text-[#DEB092] hover:underline mt-1.5 font-medium"
            >
              {toast.actionText ?? "View →"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
