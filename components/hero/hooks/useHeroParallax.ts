"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export interface ParallaxLayerConfig {
  /** CSS selector or ref-bound element to animate */
  selector: string;
  /** How far the layer should travel on full mouse excursion, in px */
  strength: number;
  /** Optional independent rotation amount, in degrees */
  rotation?: number;
}

interface UseHeroParallaxOptions {
  layers: ParallaxLayerConfig[];
  /** Disable on touch / reduced-motion devices */
  disabled?: boolean;
}

/**
 * Drives a GSAP quickTo-based parallax effect across a set of layered
 * elements inside a container. Each layer moves at its own configured
 * strength so the composition reads as having real depth.
 */
export function useHeroParallax<T extends HTMLElement>({
  layers,
  disabled = false,
}: UseHeroParallaxOptions) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarsePointer) return;

    const quickSetters = layers.map(({ selector, strength, rotation }) => {
      const el = container.querySelector<HTMLElement>(selector);
      if (!el) return null;

      const setX = gsap.quickTo(el, "x", {
        duration: 1.1,
        ease: "power3.out",
      });
      const setY = gsap.quickTo(el, "y", {
        duration: 1.1,
        ease: "power3.out",
      });
      const setRotate = rotation
        ? gsap.quickTo(el, "rotate", {
            duration: 1.4,
            ease: "power3.out",
          })
        : null;

      return { strength, setX, setY, setRotate, rotation };
    });

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;

      quickSetters.forEach((setter) => {
        if (!setter) return;
        const { strength, setX, setY, setRotate, rotation } = setter;
        setX(relX * strength);
        setY(relY * strength);
        if (setRotate && rotation) {
          setRotate(relX * rotation);
        }
      });
    };

    const handlePointerLeave = () => {
      quickSetters.forEach((setter) => {
        if (!setter) return;
        setter.setX(0);
        setter.setY(0);
        setter.setRotate?.(0);
      });
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [layers, disabled]);

  return containerRef;
}
