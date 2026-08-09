"use client";

export default function Button({
  children,
  variant = "solid",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden font-body text-[12px] tracking-[0.14em] uppercase px-[34px] py-4 border cursor-pointer transition-colors duration-[400ms] group disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === "solid" ? "border-champagne" : "border-[rgba(253,248,246,0.4)]"
      } text-warmwhite hover:text-matte-black ${className}`}
    >
      {/* fill layer — matches .btn::before / .btn.ghost::before scaleX(0)->scaleX(1) on hover */}
      <span
        className={`absolute inset-0 -z-10 scale-x-0 origin-left transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 ${
          variant === "solid" ? "bg-champagne" : "bg-maroon"
        }`}
      />
      {children}
    </button>
  );
}
