import Link from "next/link";

export const metadata = { title: "Access Denied — SANAÉRA" };

export default function ForbiddenPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 text-center outline-none">
      <span className="font-label text-[11px] tracking-[0.26em] uppercase text-antique-gold mb-5">
        403
      </span>
      <h1 className="font-display text-4xl text-warmwhite mb-4">Access denied</h1>
      <p className="text-sm text-text-secondary max-w-[420px] mb-8">
        You don't have permission to view this page. If you think this is a
        mistake, contact an administrator.
      </p>
      <Link
        href="/"
        className="text-[12px] uppercase tracking-[0.14em] text-champagne hover:underline"
      >
        Return home
      </Link>
    </main>
  );
}
