"use client";

import { useEffect, useRef } from "react";

const THREAD_PATH =
  "M12,0 C 2,60 22,120 12,180 C 2,240 22,300 12,360 C 2,420 22,480 12,540 C 2,600 22,660 12,720 C 2,780 22,840 12,900 C 2,940 22,970 12,1000";

export default function ScrollIndicator() {
  const progressRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      el.style.strokeDashoffset = `${len - len * pct}`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="hidden md:flex fixed right-[22px] top-0 h-screen w-6 z-[500] pointer-events-none items-center">
      <svg viewBox="0 0 24 1000" preserveAspectRatio="none" className="h-[70vh]">
        <path
          d={THREAD_PATH}
          fill="none"
          stroke="#DEB092"
          strokeWidth="1.4"
          strokeDasharray="1 6"
          strokeLinecap="round"
        />
        <path
          ref={progressRef}
          d={THREAD_PATH}
          fill="none"
          stroke="#DEB092"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
        />
      </svg>
    </div>
  );
}
