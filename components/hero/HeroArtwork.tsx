"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";

interface HeroArtworkProps {
  className?: string;
}

/**
 * Renders the heritage composition (antique frame, blueprint backdrop,
 * textile collage, portrait, brass key) as a single real transparent
 * asset — `/public/hero/hero-artwork.png` — with its true silhouette
 * (not a rectangular crop), so the burgundy background shows through
 * around the frame naturally. Gets a whole-panel tilt/parallax and a
 * soft entrance. If the elements ever come as fully separated layer
 * files (frame, key, portrait, textiles, blueprint each on their own),
 * this can be rebuilt into independently-parallaxing layers.
 */
export default function HeroArtwork({ className = "" }: HeroArtworkProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const panel = panelRef.current;
    if (!wrapper || !panel) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    const setX = gsap.quickTo(panel, "x", { duration: 1.1, ease: "power3.out" });
    const setY = gsap.quickTo(panel, "y", { duration: 1.1, ease: "power3.out" });
    const setRotate = gsap.quickTo(panel, "rotateY", {
      duration: 1.1,
      ease: "power3.out",
    });
    const setTilt = gsap.quickTo(panel, "rotateX", {
      duration: 1.1,
      ease: "power3.out",
    });

    const handleMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      setX(relX * 14);
      setY(relY * 10);
      setRotate(relX * 3);
      setTilt(-relY * 3);
    };

    const handleLeave = () => {
      setX(0);
      setY(0);
      setRotate(0);
      setTilt(0);
    };

    wrapper.addEventListener("pointermove", handleMove);
    wrapper.addEventListener("pointerleave", handleLeave);
    return () => {
      wrapper.removeEventListener("pointermove", handleMove);
      wrapper.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full max-w-[760px] ${className}`}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative aspect-[925/789] w-full will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Image
          src="/hero/hero-artwork.png"
          alt="Antique frame composition: architectural blueprint of a heritage monument, a handloom textile swatch collage, and a portrait in bridal wear, joined by an ornate brass key"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 92vw"
          className="object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.55)]"
        />
      </motion.div>
    </div>
  );
}
