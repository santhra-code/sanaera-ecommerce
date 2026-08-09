"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import Button from "./Button";
import Eyebrow from "./Eyebrow";

// Deterministic pseudo-random so server and client render the same particle
// layout (avoids hydration mismatches from Math.random()).
function seeded(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

export default function Hero() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: seeded(i) * 100,
        duration: 10 + seeded(i + 50) * 14,
        delay: seeded(i + 100) * 10,
      })),
    []
  );

  return (
    <section className="relative h-screen min-h-[680px] overflow-hidden flex items-end bg-[linear-gradient(160deg,#2D0C1C_0%,#381222_46%,#441629_78%,#5c1f35_100%)]">
      {/* fabric texture overlay */}
      <div
        className="absolute inset-0 opacity-50 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 7px)",
        }}
      />

      {/* ambient color washes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(222,176,146,0.2),transparent_55%),radial-gradient(ellipse_at_15%_85%,rgba(68,22,41,0.35),transparent_55%)]" />

      {/* decorative flower / paisley motif — floats slowly, top-right */}
      <svg
        viewBox="0 0 400 400"
        fill="none"
        className="absolute -top-[8%] -right-[6%] w-[52vw] max-w-[720px] opacity-50 animate-[float-slow_14s_ease-in-out_infinite]"
      >
        <path
          d="M200 40 C 260 60 300 120 280 180 C 320 190 340 240 310 280 C 340 300 330 350 290 360 C 260 390 200 380 200 340 C 200 380 140 390 110 360 C 70 350 60 300 90 280 C 60 240 80 190 120 180 C 100 120 140 60 200 40 Z"
          stroke="#DEB092"
          strokeWidth="1"
        />
        <circle cx="200" cy="210" r="26" stroke="#DEB092" strokeWidth="1" />
        <path d="M200 236 Q 210 280 200 340" stroke="#DEB092" strokeWidth="1" />
      </svg>

      {/* floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-champagne opacity-55 blur-[0.3px] animate-[drift_linear_infinite]"
            style={{
              left: `${p.left}%`,
              bottom: "-10px",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full flex items-end justify-between gap-10 px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Eyebrow color="text-champagne" className="block mb-5">The Autumn Reverie — 2026</Eyebrow>
          <h1 className="font-display font-normal text-warmwhite leading-[1.04] tracking-[0.005em] text-[clamp(40px,6.2vw,96px)] max-w-[15ch]">
            Where India&apos;s <em className="italic text-champagne">Heritage</em> Meets Modern
            Luxury.
          </h1>
          <div className="flex gap-[18px] mt-10">
            <Button variant="solid">Discover Collection</Button>
            <Button variant="ghost">Explore Heritage</Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="hidden lg:block text-right text-sand text-[13px] leading-[1.9] max-w-[220px]"
        >
          <span className="font-display text-[15px] text-champagne tracking-wide">01 / 06</span>
          <br />
          Hand-embroidered in Lucknow.
          <br />
          Woven in Varanasi.
          <br />
          Worn by the world.
        </motion.div>
      </div>

      <div className="absolute bottom-7 left-12 z-10 flex items-center gap-3 text-sand text-[11px] uppercase tracking-[0.2em]">
        <span>Scroll</span>
        <span className="w-px h-[38px] bg-[rgba(232,216,207,0.35)] relative overflow-hidden">
          <span className="absolute left-0 top-0 w-full h-3 bg-champagne animate-[scrolldown_2s_ease-in-out_infinite]" />
        </span>
      </div>

      <style>{`
        @keyframes scrolldown {
          0% { top: -20%; }
          100% { top: 110%; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-22px) rotate(1.4deg); }
        }
        @keyframes drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: .7; }
          90% { opacity: .5; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

