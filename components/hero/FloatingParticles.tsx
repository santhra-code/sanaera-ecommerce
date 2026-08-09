"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 4,
    driftX: (Math.random() - 0.5) * 60,
    driftY: (Math.random() - 0.5) * 80,
  }));
}

/**
 * A field of very faint drifting motes that give the burgundy backdrop a
 * sense of depth and air, like dust suspended in gallery light.
 */
export default function FloatingParticles({
  count = 30,
  className = "",
}: FloatingParticlesProps) {
  const particles = useMemo(() => createParticles(count), [count]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>("[data-particle]")
    );

    const tweens = nodes.map((node, i) => {
      const particle = particles[i];
      return gsap.to(node, {
        x: particle.driftX,
        y: particle.driftY,
        opacity: 0.05,
        duration: particle.duration,
        delay: particle.delay,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, [particles]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          data-particle
          className="absolute rounded-full bg-[#f3e6c8] opacity-20 will-change-transform"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
}
