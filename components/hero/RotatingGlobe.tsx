"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface RotatingGlobeProps {
  /** Controls position/size of the globe's bounding box. Defaults to filling the parent. */
  className?: string;
}

/**
 * A CSS-rendered globe motif rotates slowly at low opacity as a watermark
 * behind the headline; it has no external asset dependency.
 */
export default function RotatingGlobe({
  className = "inset-0",
}: RotatingGlobeProps) {
  const globeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = globeRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const tween = gsap.to(el, {
      rotate: 360,
      duration: prefersReducedMotion ? 0 : 90,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      className={`pointer-events-none absolute flex items-center justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        ref={globeRef}
        className="relative aspect-square h-[140%] w-[140%] rounded-full border border-champagne/40 opacity-[0.1] mix-blend-soft-light will-change-transform"
      >
        <div className="absolute inset-[8%] rounded-full border border-champagne/40" />
        <div className="absolute inset-[22%] rounded-full border border-champagne/40" />
        <div className="absolute inset-y-0 left-1/2 w-1/2 -translate-x-1/2 rounded-[50%] border-x border-champagne/40" />
        <div className="absolute inset-x-0 top-1/2 h-[38%] -translate-y-1/2 rounded-[50%] border-y border-champagne/40" />
      </div>
    </div>
  );
}
