"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface HeroButtonsProps {
  className?: string;
}

const buttonVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function HeroButtons({ className = "" }: HeroButtonsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        custom={1.1}
      >
        <Link
          href="/collections"
          className="group relative inline-flex items-center overflow-hidden border border-[#d9c9a3]/50 bg-white/[0.03] px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#f3e6c8] backdrop-blur-sm transition-transform duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(201,164,92,0.55)]"
        >
          <span className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-gradient-to-t from-[#c9a45c] to-[#e6c98a] transition-transform duration-500 ease-out group-hover:scale-y-100" />
          <span className="relative transition-colors duration-500 group-hover:text-[#2a0f16]">
            Discover Collection
          </span>
        </Link>
      </motion.div>

      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        custom={1.25}
      >
        <Link
          href="/heritage"
          className="group relative inline-flex items-center overflow-hidden border border-[#d9c9a3]/30 bg-transparent px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#e9dcc0]/90 transition-transform duration-500 ease-out hover:-translate-y-1 hover:border-[#d9c9a3]/60 hover:shadow-[0_18px_40px_-14px_rgba(201,164,92,0.35)]"
        >
          <span className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-gradient-to-t from-[#c9a45c]/90 to-[#e6c98a]/90 transition-transform duration-500 ease-out group-hover:scale-y-100" />
          <span className="relative transition-colors duration-500 group-hover:text-[#2a0f16]">
            Explore Heritage
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
