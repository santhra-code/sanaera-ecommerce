"use client";

import { useState } from "react";
import { Product, themeGradient } from "@/lib/products";

const VIEW_MODES = ["Photo", "Fabric Zoom", "Catwalk"] as const;

const TRUST_BADGES = [
  {
    icon: "👑",
    title: "100% Authentic Heritage",
    desc: "Certified pure mulberry silk & real zari",
  },
  {
    icon: "🧵",
    title: "210+ Hours Karigari",
    desc: "Hand-embroidered by Jaipur master artisans",
  },
  {
    icon: "📐",
    title: "Bespoke Tailoring",
    desc: "Custom sizing options available",
  },
  {
    icon: "✈️",
    title: "Insured Global Shipping",
    desc: "Complimentary express delivery over ₹75,000",
  },
];

export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<(typeof VIEW_MODES)[number]>("Photo");
  const images = product.images.length ? product.images : [];
  const activeImage = images[Math.min(active, images.length - 1)] ?? null;

  return (
    <div className="w-full max-w-[620px] mx-auto flex flex-col gap-5 lg:sticky lg:top-28">
      {/* Main Gallery Display */}
      <div className="flex gap-4 items-start w-full">
        <div className="hidden sm:flex flex-col gap-1.5 w-[72px] max-h-[580px] overflow-y-auto flex-shrink-0 scrollbar-none">
          {images.map((image, i) => (
            <button
              key={image.url + i}
              onClick={() => setActive(i)}
              className={`aspect-[3/4] overflow-hidden transition-opacity ${
                active === i ? "opacity-100 ring-1 ring-inset ring-champagne" : "opacity-55"
              }`}
              aria-label={`View image ${i + 1}: ${image.alt ?? product.name}`}
            >
              <img src={image.url} alt={image.alt ?? product.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div
          className="relative flex-1 aspect-[3/4] max-h-[70vh] overflow-hidden fabric-texture rounded-sm"
          style={{ background: themeGradient[product.swatchTheme] }}
        >
          {activeImage && (
            <img
              src={activeImage.url}
              alt={activeImage.alt ?? product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.05]"
            />
          )}
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

      {/* Trust & Heritage Badges */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {TRUST_BADGES.map((b) => (
          <div
            key={b.title}
            className="bg-emerald-deep/40 border border-line p-3 flex items-start gap-2.5 rounded-sm"
          >
            <span className="text-base leading-none mt-0.5">{b.icon}</span>
            <div>
              <div className="font-display text-[12px] text-warmwhite tracking-wide">{b.title}</div>
              <div className="text-[10.5px] text-charcoal/60 leading-tight mt-0.5">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Artisan Spotlight Highlight */}
      <div className="bg-gradient-to-r from-emerald-deep via-maroon/25 to-emerald-deep border border-line p-3.5 rounded-sm">
        <div className="text-[10px] uppercase tracking-[0.14em] text-antique-gold font-semibold mb-1">
          ✦ Artisan Spotlight · Jaipur Atelier
        </div>
        <p className="text-[11.5px] text-warmwhite/80 leading-relaxed">
          Hand-tailored to order by master karigars. Preserving centuries of royal Banarasi & Zardozi craft.
        </p>
      </div>
    </div>
  );
}
