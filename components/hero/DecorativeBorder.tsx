"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

interface DecorativeBorderProps {
  className?: string;
}

/**
 * The royal procession strip (elephants, horses, attendants, lotus
 * blooms) along the base of the Hero.
 *
 * Ships from `/public/hero/hero-border.png`. The art repeats internally
 * but its outer edges aren't a perfect seamless tile, so instead of an
 * infinite scroll (which would show a visible seam) it does a slow,
 * gentle side-to-side drift within safe bounds. If you get a true
 * seamless-tile export of this motif later, this can switch to a proper
 * infinite marquee.
 */
export default function DecorativeBorder({ className = "" }: DecorativeBorderProps) {
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const tween = gsap.to(el, {
      backgroundPosition: "8% center",
      duration: 30,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      className={`relative h-16 w-full overflow-hidden border-t border-[#e9dcc0]/10 sm:h-[70px] ${className}`}
      aria-hidden="true"
    >
      <div
        ref={imageRef}
        className="h-full w-full will-change-[background-position]"
        style={{
          backgroundImage: "url('/hero/hero-border.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
