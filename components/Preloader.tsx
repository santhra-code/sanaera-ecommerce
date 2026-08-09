"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-matte-black flex items-center justify-center transition-[opacity,visibility] duration-1000 ${
        hidden ? "opacity-0 invisible" : "opacity-100 visible"
      }`}
    >
      <div className="text-center">
        <div className="font-display text-[15px] text-sand tracking-[0.55em] uppercase">
          SANAÉRA
        </div>
        <div className="w-[220px] h-px bg-[rgba(222,176,146,0.25)] mt-[22px] relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-champagne w-0 animate-[preload_2.2s_ease_forwards]" />
        </div>
      </div>
      <style>{`
        @keyframes preload {
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
