"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { formatSingleItemMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const SIZES = ["XS", "S", "M", "L", "XL", "Custom"];
const COLORS = ["#6B1B2E", "#1B4332", "#DEB092", "#1a0610"];

/**
 * Human-readable names for the swatch hex values, used only in the
 * WhatsApp order message. Matched loosely to this project's existing
 * Tailwind color tokens (maroon / emerald / champagne / matte-black) —
 * double check these against your actual design tokens and rename freely.
 */
const COLOR_NAMES: Record<string, string> = {
  "#6B1B2E": "Maroon",
  "#1B4332": "Emerald",
  "#DEB092": "Champagne",
  "#1a0610": "Ink Black",
};

const ACCORDION = [
  {
    title: "Craftsmanship Story",
    body: "Hand-embroidered by the karigars of Jaipur using traditional zardozi work — gold and silver thread laid over hand-dyed silk, a technique dating back to the Mughal courts. Each piece takes roughly 210 hours to complete.",
  },
  {
    title: "Fabric & Origin",
    body: "Pure mulberry silk base, sourced from Karnataka sericulture farms. Zari thread is 92.5% silver, gold-plated. Finished with hand-tied tassels.",
  },
  {
    title: "Size & Fit",
    body: "Runs true to size with a fitted silhouette. Custom tailoring available at no extra cost — submit measurements after checkout.",
  },
  {
    title: "Care Instructions",
    body: "Dry clean only. Store folded in muslin cloth away from direct sunlight. Avoid contact with perfume or water on embroidered areas.",
  },
  {
    title: "Sustainability",
    body: "Made to order to avoid overproduction. Packaged in a reusable silk box with biodegradable filler. Artisans paid above fair-trade benchmark wages.",
  },
];

export default function ProductInfo({ product }: { product: Product }) {
  const [size, setSize] = useState("S");
  const [color, setColor] = useState(COLORS[0]);
  const [openIndex, setOpenIndex] = useState(0);

  const buyNowUrl = buildWhatsAppUrl(
    formatSingleItemMessage({
      title: product.name,
      size,
      color: COLOR_NAMES[color] ?? null,
      priceLabel: product.price,
    })
  );

  return (
    <div className="border-l border-line px-6 lg:px-12 py-12 max-lg:border-l-0 max-lg:border-t max-lg:pt-10">
      <div className="text-xs uppercase tracking-[0.12em] text-antique-gold mb-2.5">
        {product.category}
      </div>
      <h1 className="font-display font-normal text-[clamp(30px,3vw,42px)] leading-tight mb-3.5">
        {product.name}
      </h1>
      <div className="flex items-baseline gap-3.5 mb-5">
        <span className="font-display text-2xl text-maroon">{product.price}</span>
        {product.oldPrice && (
          <span className="text-sm text-charcoal/40 line-through">{product.oldPrice}</span>
        )}
      </div>
      <div className="text-xs text-charcoal/60 mb-8 flex gap-2 items-center">
        <span className="text-champagne tracking-[2px]">★★★★★</span>
        4.9 · 128 reviews · 340 sold this season
      </div>

      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.12em] text-charcoal/60 mb-2.5">
          Colour
        </div>
        <div className="flex gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-[30px] h-[30px] rounded-full border-2 transition-colors ${
                color === c ? "border-champagne" : "border-transparent"
              }`}
              style={{ background: c }}
              aria-label={`Colour ${COLOR_NAMES[c] ?? c}`}
            />
          ))}
        </div>
      </div>

      <div className="mb-3.5">
        <div className="text-[11px] uppercase tracking-[0.12em] text-charcoal/60 mb-2.5">
          Size
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-4.5 py-2.5 border text-[12.5px] transition-colors ${
                size === s
                  ? "bg-champagne text-matte-black border-champagne"
                  : "border-line hover:bg-champagne hover:text-matte-black hover:border-champagne"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <button className="text-xs text-emerald flex items-center gap-2 mb-8 hover:underline">
        ✦ Find your size with AI Stylist →
      </button>

      <div className="flex gap-3.5 mb-3.5">
        <button className="flex-1 text-[12px] uppercase tracking-[0.14em] py-[18px] bg-champagne text-matte-black border border-champagne hover:bg-maroon hover:border-maroon transition-colors">
          Add to Bag
        </button>
        <button className="w-14 border border-champagne text-champagne hover:bg-champagne hover:text-matte-black transition-colors">
          ♡
        </button>
      </div>

      <a
        href={buyNowUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-[12px] uppercase tracking-[0.14em] py-[18px] bg-maroon text-warmwhite border border-maroon hover:bg-maroon/85 transition-colors mb-3.5"
      >
        Buy Now via WhatsApp
      </a>

      <button className="w-full text-[12px] uppercase tracking-[0.14em] py-[18px] border border-champagne text-champagne hover:bg-champagne hover:text-matte-black transition-colors mb-7">
        Book a Video Consultation
      </button>

      <div className="border border-line px-5 py-4.5 mb-8 text-[13px] leading-[1.8] text-charcoal/70">
        <b className="text-warmwhite">Delivery estimate:</b> 6–9 business days (made to order) ·{" "}
        <b className="text-warmwhite">Express:</b> 3 days available at checkout.
        <br />
        Complimentary global shipping on orders above ₹75,000.
      </div>

      <div className="border-t border-line">
        {ACCORDION.map((item, i) => (
          <div key={item.title} className="border-b border-line">
            <button
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full flex justify-between items-center py-4.5 text-[13px] uppercase tracking-[0.05em] text-left"
            >
              {item.title}
              <span
                className={`text-antique-gold text-base transition-transform ${
                  openIndex === i ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className="overflow-hidden transition-[max-height] duration-400"
              style={{ maxHeight: openIndex === i ? 300 : 0 }}
            >
              <p className="text-[13.5px] leading-[1.9] text-charcoal/70 pb-5">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
