"use client";

/**
 * IntroAnimation.tsx
 * ---------------------------------------------------------------------------
 * A luxury, cinematic "parchment scroll" intro overlay for SANAÉRA.
 *
 * Flow:
 *  1. Dark burgundy overlay covers the screen, homepage hidden underneath.
 *  2. Rolled-up scroll fades + scales in at the center.
 *  3. Scroll "unrolls" — rollers move apart, parchment stretches down.
 *  4. Greeting text fades up with letter-spacing animation.
 *  5. Hold for ~5.5s so the visitor can read it.
 *  6. Scroll rolls back up and disappears.
 *  7. Overlay fades out, revealing the homepage. Component unmounts.
 *
 * Runs once per browser session via sessionStorage. On refresh within the
 * same session it is skipped entirely (checked synchronously before paint
 * to avoid any flash of the animation).
 *
 * Stack: React + TypeScript + Tailwind CSS + Framer Motion only (no GSAP).
 * ---------------------------------------------------------------------------
 */

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** sessionStorage key — flips to "true" once the intro has played this tab session. */
const SESSION_KEY = "introPlayed";

/** Path to your transparent parchment scroll PNG (drop it in /public). */
const SCROLL_IMAGE_SRC = "/scroll.png";

/** Timing (ms) — mirrors the Framer Motion durations below, used only for
 *  scheduling the "hold" -> "closing" -> "done" state transitions. */
const TIMINGS = {
  openDuration: 1800, // scroll unroll (1.5–2s)
  holdDuration: 5500, // time greeting stays fully visible
  closeDuration: 1500, // scroll roll-up
  overlayFadeDuration: 800, // final fade to reveal homepage
};

// Animation phases the sequence moves through, in order.
type Phase = "entering" | "opening" | "holding" | "closing" | "revealing" | "done";

// ---------------------------------------------------------------------------
// Framer Motion Variants
// ---------------------------------------------------------------------------

/** Full-screen burgundy overlay. Fades in instantly, fades out at the very end. */
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMINGS.overlayFadeDuration / 1000, ease: "easeInOut" },
  },
};

/** Scroll wrapper: fade-in + scale 0.9 -> 1 with soft shadow, per the brief. */
const scrollWrapperVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  entering: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }, // smooth luxury easing
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

/**
 * The parchment "paper" itself. Uses scaleY + clip-path together so the
 * unroll reads as paper stretching downward from a rolled origin, rather
 * than a flat resize. transformOrigin stays at the top roller.
 */
const paperVariants: Variants = {
  rolled: {
    scaleY: 0.02,
    opacity: 0.6,
  },
  open: {
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: TIMINGS.openDuration / 1000,
      ease: [0.16, 1, 0.3, 1], // gentle deceleration — no sudden jumps
    },
  },
  closed: {
    scaleY: 0.02,
    opacity: 0.6,
    transition: {
      duration: TIMINGS.closeDuration / 1000,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

/** Top roller: slides + rotates upward/outward as the scroll opens. */
const topRollerVariants: Variants = {
  rolled: { y: 0, rotate: 0 },
  open: {
    y: -110,
    rotate: -8,
    transition: { duration: TIMINGS.openDuration / 1000, ease: [0.16, 1, 0.3, 1] },
  },
  closed: {
    y: 0,
    rotate: 0,
    transition: { duration: TIMINGS.closeDuration / 1000, ease: [0.7, 0, 0.84, 0] },
  },
};

/** Bottom roller: mirrors the top roller, moving downward/outward. */
const bottomRollerVariants: Variants = {
  rolled: { y: 0, rotate: 0 },
  open: {
    y: 110,
    rotate: 8,
    transition: { duration: TIMINGS.openDuration / 1000, ease: [0.16, 1, 0.3, 1] },
  },
  closed: {
    y: 0,
    rotate: 0,
    transition: { duration: TIMINGS.closeDuration / 1000, ease: [0.7, 0, 0.84, 0] },
  },
};

/** Greeting text block: fade + rise, staggering each line. */
const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

const textLineVariants: Variants = {
  hidden: { opacity: 0, y: 16, letterSpacing: "0.02em" },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: "0.18em",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface IntroAnimationProps {
  /** Optional: override the brand name shown in the scroll. */
  brandName?: string;
  /** Optional: override the tagline shown beneath the brand name. */
  tagline?: string;
  /** Optional callback fired once the intro has fully finished and unmounted. */
  onComplete?: () => void;
}

export default function IntroAnimation({
  brandName = "SANAÉRA",
  tagline = "Luxury. Heritage. Elegance.",
  onComplete,
}: IntroAnimationProps) {
  // null = "still deciding" (prevents any flash before the sessionStorage
  // check resolves); false = never render; true = play the sequence.
  const [shouldPlay, setShouldPlay] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("entering");

  // Track timers so we can clean them up on unmount (no leaked callbacks).
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ---- Step 0: decide, synchronously on mount, whether to play at all. ----
  useEffect(() => {
    try {
      const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "true";
      setShouldPlay(!alreadyPlayed);
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) — fail safe by skipping.
      setShouldPlay(false);
    }
  }, []);

  // ---- Drive the phase machine once we know we should play. ----
  useEffect(() => {
    if (shouldPlay !== true) return;

    // Mark as played immediately so a refresh mid-animation won't replay it.
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      /* no-op — non-critical if storage write fails */
    }

    // Lock background scroll while the intro is active.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timers.current.push(id);
    };

    // entering -> opening (let the fade/scale-in read before unrolling)
    schedule(() => setPhase("opening"), 700);
    // opening -> holding
    schedule(() => setPhase("holding"), 700 + TIMINGS.openDuration);
    // holding -> closing
    schedule(
      () => setPhase("closing"),
      700 + TIMINGS.openDuration + TIMINGS.holdDuration
    );
    // closing -> revealing (fade the overlay out)
    schedule(
      () => setPhase("revealing"),
      700 + TIMINGS.openDuration + TIMINGS.holdDuration + TIMINGS.closeDuration
    );
    // revealing -> done (unmount + restore scroll + notify parent)
    schedule(
      () => {
        setPhase("done");
        document.body.style.overflow = originalOverflow;
        onComplete?.();
      },
      700 +
        TIMINGS.openDuration +
        TIMINGS.holdDuration +
        TIMINGS.closeDuration +
        TIMINGS.overlayFadeDuration
    );

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldPlay, onComplete]);

  // Nothing to render: still deciding, opted out, or finished.
  if (shouldPlay !== true || phase === "done") return null;

  const scrollState = phase === "opening" || phase === "holding" ? "open" : phase === "closing" ? "closed" : "rolled";
  const textVisible = phase === "holding";

  return (
    <AnimatePresence>
      {phase !== "revealing" ? (
        <Overlay key="intro-overlay">
          <ScrollGraphic
            scrollState={scrollState}
            brandName={brandName}
            tagline={tagline}
            textVisible={textVisible}
          />
        </Overlay>
      ) : (
        // "revealing" phase: render the overlay one more time so AnimatePresence
        // can play its exit transition (opacity -> 0) before unmounting for good.
        <Overlay key="intro-overlay-exit" exiting />
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Full-viewport burgundy overlay wrapper. */
function Overlay({
  children,
  exiting = false,
}: {
  children?: React.ReactNode;
  exiting?: boolean;
}) {
  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate={exiting ? "exit" : "visible"}
      exit="exit"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2B0816] px-6"
      aria-hidden={exiting}
      role="dialog"
      aria-label="Welcome introduction"
    >
      {children}
    </motion.div>
  );
}

function ScrollGraphic({
  scrollState,
  brandName,
  tagline,
  textVisible,
}: {
  scrollState: "rolled" | "open" | "closed";
  brandName: string;
  tagline: string;
  textVisible: boolean;
}) {
  return (
    <motion.div
      variants={scrollWrapperVariants}
      initial="initial"
      animate="entering"
      exit="exit"
      className="relative flex w-full max-w-md flex-col items-center"
    >
      {/* Subtle gold ambient glow behind the scroll */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 mx-auto h-full w-full max-w-sm rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(212,175,110,0.18) 0%, rgba(212,175,110,0) 70%)" }}
      />

      {/* Rollers + paper stack */}
      <div className="relative flex w-full flex-col items-center">
        {/* Top roller */}
        <motion.div
          variants={topRollerVariants}
          animate={scrollState}
          className="relative z-20 h-4 w-[85%] max-w-xs rounded-full shadow-lg"
          style={{
            background: "linear-gradient(180deg, #E8C98A 0%, #9C7A3C 50%, #6B5024 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
          }}
        />

        {/* Parchment paper — the user's PNG asset, stretched vertically */}
        <div className="relative z-10 w-[85%] max-w-xs overflow-hidden" style={{ minHeight: "1px" }}>
          <motion.div
            variants={paperVariants}
            animate={scrollState}
            style={{ transformOrigin: "top center" }}
            className="relative flex flex-col items-center justify-center px-6 py-14 shadow-2xl"
          >
            {/* Background parchment image.
                Swap the src on SCROLL_IMAGE_SRC (top of file) for your asset.
                object-fit: fill lets it stretch to sell the "unroll" effect. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SCROLL_IMAGE_SRC}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-fill"
              draggable={false}
            />

            {/* Soft gold inner glow on the paper, per the brief */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 40px rgba(212,175,110,0.12)" }}
            />

            {/* Greeting text — only rendered once fully open, faded via AnimatePresence */}
            <AnimatePresence>
              {textVisible && (
                <motion.div
                  key="intro-text"
                  variants={textContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <motion.p
                    variants={textLineVariants}
                    className="font-serif text-sm uppercase tracking-widest text-[#5C4326]"
                  >
                    Welcome to
                  </motion.p>
                  <motion.h1
                    variants={textLineVariants}
                    className="mt-2 font-serif text-3xl font-semibold uppercase text-[#4A2E12] sm:text-4xl"
                    style={{ textShadow: "0 1px 0 rgba(255,255,255,0.15)" }}
                  >
                    {brandName}
                  </motion.h1>
                  <motion.p
                    variants={textLineVariants}
                    className="mt-3 font-serif text-xs uppercase tracking-[0.3em] text-[#6B5024]"
                  >
                    {tagline}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom roller */}
        <motion.div
          variants={bottomRollerVariants}
          animate={scrollState}
          className="relative z-20 h-4 w-[85%] max-w-xs rounded-full shadow-lg"
          style={{
            background: "linear-gradient(180deg, #E8C98A 0%, #9C7A3C 50%, #6B5024 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
          }}
        />
      </div>
    </motion.div>
  );
}
