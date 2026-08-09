"use client";

import { motion } from "framer-motion";
import HeroButtons from "./HeroButtons";

interface HeroContentProps {
  eyebrow?: string;
  headlineBefore?: string;
  headlineHighlight?: string;
  headlineMiddle?: string;
  headlineAfter?: string;
  className?: string;
}

const wordVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HeroContent({
  eyebrow = "The Autumn Reverie — 2026",
  headlineBefore = "Where India's",
  headlineHighlight = "Heritage",
  headlineMiddle = "Meets",
  headlineAfter = "Modern Luxury.",
  className = "",
}: HeroContentProps) {
  return (
    <div className={`flex max-w-[720px] flex-col gap-8 ${className}`}>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-[0.7rem] font-medium uppercase tracking-[0.36em] text-[#c9a45c]"
      >
        {eyebrow}
      </motion.p>

      <h1
  className="font-display font-light text-[#F6EFE0]"
  style={{
    fontSize: "clamp(4rem, 7vw, 6.25rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
  }}
>
        <motion.span
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          className="block"
        >
          {headlineBefore}
        </motion.span>
        <motion.span
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="block italic text-[#c9a45c]"
        >
          {headlineHighlight}
          <span className="not-italic text-[#f6efe0]"> {headlineMiddle}</span>
        </motion.span>
        <motion.span
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="block"
        >
          {headlineAfter}
        </motion.span>
      </h1>

      <HeroButtons className="mt-2" />
    </div>
  );
}
