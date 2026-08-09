"use client";

import { motion } from "framer-motion";

interface ScrollIndicatorProps {
  className?: string;
}

export default function ScrollIndicator({ className = "" }: ScrollIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
      className={`flex items-center gap-3 text-[#e9dcc0]/80 ${className}`}
    >
      <span className="text-[0.68rem] font-medium uppercase tracking-[0.32em]">
        Scroll
      </span>
      <span className="relative h-9 w-px overflow-hidden bg-[#e9dcc0]/25">
        <motion.span
          className="absolute inset-x-0 top-0 h-1/2 bg-[#c9a45c]"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}
