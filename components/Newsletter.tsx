"use client";

import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

export default function Newsletter() {
  return (
    <section className="px-12 py-[120px] text-center bg-ivory max-md:px-6 max-md:py-20">
      <Reveal>
        <Eyebrow className="block mb-4">The Inner Circle</Eyebrow>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display font-normal italic text-[clamp(30px,4vw,50px)] mb-5">
          Join the loyalty circle.
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-text-secondary text-sm mb-10">
          Early access to limited editions, private trunk shows, and bridal appointments —
          reserved for members.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <form
          className="flex max-w-[480px] mx-auto border-b border-champagne pb-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 bg-transparent font-body text-sm outline-none tracking-[0.02em] text-warmwhite placeholder:text-text-secondary"
          />
          <button
            type="submit"
            className="font-label text-[11px] tracking-[0.16em] uppercase text-maroon cursor-pointer"
          >
            Subscribe →
          </button>
        </form>
      </Reveal>
    </section>
  );
}
