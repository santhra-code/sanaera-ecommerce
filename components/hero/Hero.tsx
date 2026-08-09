"use client";

import HeroContent from "./HeroContent";
import HeroArtwork from "./HeroArtwork";
import RotatingGlobe from "./RotatingGlobe";
import FloatingParticles from "./FloatingParticles";
import DecorativeBorder from "./DecorativeBorder";
import ScrollIndicator from "./ScrollIndicator";

interface HeroProps {
  className?: string;
}

/**
 * SANAÉRA homepage Hero, tuned to match the approved reference composition
 * pixel-for-pixel: deep plum background (#3b1821 sampled from the
 * reference), the cropped heritage-artwork panel bled to the right edge,
 * and the peacock/lotus border strip along the base.
 *
 *   import { Hero } from "@/components/hero";
 *   ...
 *   <Hero />
 */
export default function Hero({ className = "" }: HeroProps) {
  return (
    <section
      className={`relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-[#3b1821] ${className}`}
      aria-label="SANAÉRA — Where India's Heritage Meets Modern Luxury"
    >
      {/* Base background — sampled directly from the reference (flat, with a
          faint warm lift near the artwork panel rather than a strong gradient) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 82% 30%, rgba(90,35,50,0.35) 0%, rgba(59,24,33,0) 60%), #3b1821",
        }}
      />

      <RotatingGlobe className="left-[-10%] top-[-5%] h-full w-[65%]" />
      <FloatingParticles count={20} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 pb-8 pt-10 sm:px-10 lg:flex-row lg:items-center lg:gap-10 lg:px-14 lg:pb-10 lg:pt-8">
        <div className="flex w-full flex-col justify-between gap-16 py-4 lg:h-[70vh] lg:max-h-[640px] lg:w-[44%] lg:py-8">
          <HeroContent />
          <ScrollIndicator className="hidden lg:flex" />
        </div>

        <div className="mt-14 flex w-full items-center justify-center lg:mt-0 lg:w-[56%] lg:justify-end lg:self-center">
          <HeroArtwork />
        </div>

        <ScrollIndicator className="mt-10 flex lg:hidden" />
      </div>

      <DecorativeBorder className="relative z-10" />
    </section>
  );
}
