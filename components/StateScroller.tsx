import Link from "next/link";
import Reveal from "./Reveal";

const STATES: { name: string; craft: string }[] = [
  { name: "Gujarat", craft: "Bandhani" },
  { name: "Varanasi", craft: "Silk Brocade" },
  { name: "Lucknow", craft: "Chikankari" },
  { name: "Kashmir", craft: "Pashmina" },
  { name: "Rajasthan", craft: "Bandhej" },
  { name: "Tamil Nadu", craft: "Kanjivaram" },
];

// Mirrors .hcard:nth-child(1..6)::before in the HTML exactly.
const CARD_GRADIENTS = [
  "linear-gradient(200deg,#C88F73,#381222)", // maroon -> emerald-deep
  "linear-gradient(200deg,#441629,#381222)", // emerald -> emerald-deep
  "linear-gradient(200deg,#5c1f35,#2D0C1C)", // wine-mid -> matte-black
  "linear-gradient(200deg,#6b3a42,#2D0C1C)", // rose-dust -> matte-black
  "linear-gradient(200deg,#DEB092,#8a5a4a)", // champagne -> terracotta
  "linear-gradient(200deg,#1a0610,#2D0C1C)", // wine-deep -> matte-black
];

export default function StateScroller() {
  return (
    <section className="px-12 pb-32 pt-0 max-md:px-6 max-md:pb-20 max-md:pt-0" aria-label="Shop by State of India">
      <Reveal className="flex justify-between items-end gap-10 flex-wrap mb-16">
        <h2 className="font-display font-normal text-[clamp(32px,4vw,56px)] leading-tight">
          Shop by
          <br />
          State of India
        </h2>
        <p className="max-w-[340px] text-sm leading-relaxed text-charcoal/70">
          Twenty-eight states, a thousand traditions. Begin your journey through India&apos;s
          textile geography.
        </p>
      </Reveal>
      <Reveal>
        <div
          role="region"
          aria-label="Indian textile regions"
          tabIndex={0}
          className="flex gap-0.5 overflow-x-auto pb-3 bg-line [scrollbar-width:thin] focus-visible:ring-1 focus-visible:ring-champagne"
        >
          {STATES.map((s, i) => (
            <Link
              key={s.name}
              href={`/collections?state=${encodeURIComponent(s.name.toLowerCase())}`}
              aria-label={`Explore ${s.name} ${s.craft} collection`}
              className="group min-w-[280px] aspect-[4/5] relative flex-shrink-0 overflow-hidden flex items-end p-6 transition-transform duration-300 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none"
              style={{ background: CARD_GRADIENTS[i] }}
            >
              <div className="relative z-[2]">
                <span className="font-label tracking-[0.28em] uppercase text-[11px] text-sand block mb-2 group-hover:text-champagne transition-colors">
                  {s.craft}
                </span>
                <h3 className="font-display italic text-[26px] text-warmwhite group-hover:translate-x-1 transition-transform">
                  {s.name} →
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
