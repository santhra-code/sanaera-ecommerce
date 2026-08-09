import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="font-display text-2xl tracking-[0.3em] text-warmwhite mb-10"
      >
        SANAÉRA
      </Link>
      <div className="w-full max-w-[420px] bg-emerald-deep border border-line p-10">
        {children}
      </div>
    </div>
  );
}
