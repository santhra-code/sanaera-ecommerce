"use client";

import { useState } from "react";
import { Product, themeGradient } from "@/lib/products";

const THUMB_THEMES: Product["swatchTheme"][] = ["maroon", "emerald", "champagne", "charcoal"];
const VIEW_MODES = ["Photo", "Fabric Zoom", "Catwalk"] as const;

export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<(typeof VIEW_MODES)[number]>("Photo");

  return (
    <div className="flex">
      <div className="hidden sm:flex flex-col gap-0.5 w-[88px] py-6 pl-6">
        {THUMB_THEMES.map((theme, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`aspect-[3/4] transition-opacity ${
              active === i ? "opacity-100 ring-1 ring-inset ring-champagne" : "opacity-55"
            }`}
            style={{ background: themeGradient[theme] }}
            aria-label={`View ${i + 1}`}
          />
        ))}
        <button
          onClick={() => setActive(4)}
          className={`aspect-[3/4] flex items-center justify-center text-warmwhite text-[10px] uppercase tracking-wide transition-opacity ${
            active === 4 ? "opacity-100 ring-1 ring-inset ring-champagne" : "opacity-55"
          }`}
          style={{ background: "linear-gradient(160deg,#6b3a42,#2D0C1C)" }}
        >
          360°
        </button>
      </div>

      <div
        className="relative flex-1 aspect-[4/5] m-6 overflow-hidden fabric-texture"
        style={{ background: themeGradient[product.swatchTheme] }}
      >
        <span className="absolute top-5 left-5 text-sand text-[11px] uppercase tracking-[0.08em] z-[3]">
          Hover to zoom fabric detail
        </span>
        <svg
          viewBox="0 0 300 300"
          fill="none"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56%] opacity-60"
        >
          <path
            d="M150 40 C200 55 230 100 215 150 C250 158 265 200 240 230 C215 260 150 255 150 220 C150 255 85 260 60 230 C35 200 50 158 85 150 C70 100 100 55 150 40Z"
            stroke="#FDF8F6"
            strokeWidth="0.8"
            opacity="0.7"
          />
          <circle cx="150" cy="150" r="20" stroke="#DEB092" strokeWidth="0.8" />
        </svg>

        <div className="absolute bottom-5 right-5 flex gap-2 z-[3]">
          {VIEW_MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`font-label text-[10px] uppercase tracking-[0.1em] px-4 py-2.5 border transition-colors ${
                mode === m
                  ? "bg-champagne text-matte-black border-champagne"
                  : "bg-black/55 text-warmwhite border-[rgba(253,248,246,0.3)] hover:bg-champagne hover:text-matte-black"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
