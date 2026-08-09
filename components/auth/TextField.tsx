"use client";

import { forwardRef } from "react";

const TextField = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}>(function TextField({ label, error, className = "", ...props }, ref) {
  return (
    <label className="block mb-5">
      <span className="text-[11px] uppercase tracking-[0.12em] text-text-secondary block mb-2">
        {label}
      </span>
      <input
        ref={ref}
        {...props}
        className={`w-full bg-transparent border-b border-line py-2.5 text-[14px] text-warmwhite placeholder:text-text-secondary/50 focus:outline-none focus:border-champagne transition-colors ${className}`}
      />
      {error && <span className="block mt-1.5 text-[12px] text-maroon">{error}</span>}
    </label>
  );
});

export default TextField;
