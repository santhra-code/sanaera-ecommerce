# Hero — Integration Notes (v3, real assets)

## What changed from v2

You sent over three real image files (via WhatsApp, so they arrived as
JPEGs with a solid black backdrop instead of true transparency). I keyed
the black out programmatically (luminance-based alpha, feathered edges)
and rebuilt each into a proper transparent PNG:

```
public/hero/
  hero-artwork.png   — the framed composition (blueprint, textiles,
                        portrait, key) — real transparent silhouette now,
                        not a rectangular crop
  hero-globe.png      — the rotating globe, now wired back into the Hero
                        behind the headline (it was removed in v2 since
                        there was no real asset for it yet)
  hero-border.png     — the royal procession strip (elephants, horses,
                        attendants, lotus blooms) along the base —
                        replaces the peacock/floral strip from v2
```

**All three files are already included in this delivery** — copy the
whole `public/hero/` folder alongside `components/hero/` and there's
nothing else to source.

If you have higher-resolution originals (not the WhatsApp-compressed
versions), send them over — I can re-key those instead for a cleaner edge
with zero JPEG artifacting.

Everything that *isn't* baked into those two images — the background
color, eyebrow, headline, buttons, particle field, scroll indicator — is
real code, tuned by sampling the reference directly (background is
`#3b1821`, sampled from the mockup itself).

## Trade-off, stated plainly

Because the artwork is one flattened image rather than separated layers,
the frame/key/portrait/textiles no longer parallax independently — the
whole panel gets a single, subtle tilt-on-mouse-move instead (still GSAP,
still feels alive, just one rigid plane instead of five floating ones).
Visually, at rest, it will look identical to the reference. If you later
get the original layered export (Figma/PSD with each element on its own
transparent layer), send it over and this drops back into the
independent-parallax version from the first pass.

Same trade-off on the border strip: it's a single cropped strip, not a
seamless repeating tile, so instead of an infinite scroll it does a slow
side-to-side drift within safe bounds (no visible seam). A true seamless
tile would let it become a proper infinite marquee.

## Drop-in

```tsx
import { Hero } from "@/components/hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* rest of your existing homepage, untouched */}
    </>
  );
}
```

## Dependencies

`framer-motion`, `gsap`, `next`, `react`, `tailwindcss` — same as before.

## Typography

Headline uses `font-serif`. Map it to your editorial serif if not already
configured:

```js
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      serif: ["var(--font-editorial-serif)", "ui-serif", "Georgia", "serif"],
    },
  },
}
```

## Behavior notes

- Tilt/parallax on the artwork panel and the button hover states are
  GSAP/Framer Motion; both are inert on touch devices and respect
  `prefers-reduced-motion`.
- `RotatingGlobe.tsx` and `useHeroParallax.ts` are still in the folder
  (unused by `Hero.tsx` right now) since the reference doesn't show a
  visible globe layer — kept in case you want to reintroduce one later.
- Nothing here touches your Navbar, Footer, routing, or Tailwind config
  beyond the optional `font-serif` mapping above.
