"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

interface RotatingGlobeProps {
  /** Controls position/size of the globe's bounding box. Defaults to filling the parent. */
  className?: string;
}

/**
 * A single, continuous 90-second rotation, rendered at very low opacity
 * with a soft-light blend so it reads as a watermark behind the headline
 * rather than a competing graphic element.
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
        className="relative h-[140%] w-[140%] opacity-[0.08] mix-blend-soft-light will-change-transform"
      >
        <Image
          src="/hero/hero-globe.png"
          alt=""
          fill
          priority={false}
          sizes="140vw"
          className="object-contain"
        />
      </div>
    </div>
  );
}
