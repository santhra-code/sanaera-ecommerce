import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { mergeGuestCartIntoUser } from "@/lib/merge-guest-data";
import SignOutButton from "@/components/auth/SignOutButton";

const NAV = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/cart", label: "Cart" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/payment-methods", label: "Payment Methods" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/notifications", label: "Notifications" },
  { href: "/account/security", label: "Security" },
  { href: "/account/settings", label: "Settings" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user) {
    await mergeGuestCartIntoUser(session.user.id);
  }

  return (
    <div className="min-h-screen bg-ivory pt-[110px] px-6 md:px-12 pb-24">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-[220px_1fr] gap-12">
        <aside>
          {session?.user ? (
            <>
              <div className="mb-8">
                <div className="text-[11px] uppercase tracking-[0.12em] text-text-secondary">
                  Signed in as
                </div>
                <div className="font-display text-lg text-warmwhite truncate">
                  {session.user.name || session.user.email}
                </div>
              </div>
              <nav className="flex md:flex-col gap-1 flex-wrap">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] py-2.5 px-3 -mx-3 text-text-secondary hover:text-champagne hover:bg-emerald-deep transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-8">
                <SignOutButton />
              </div>
            </>
          ) : (
            <div className="bg-emerald-deep border border-line p-5 rounded-none text-xs">
              <div className="text-champagne font-label uppercase tracking-wider mb-2">Guest Session</div>
              <p className="text-text-secondary leading-relaxed mb-4">
                Sign in to sync your bag, wishlist, and orders across all your devices.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="block w-full text-center py-2 bg-champagne text-matte-black uppercase tracking-wider text-[11px] font-medium hover:bg-maroon hover:text-warmwhite transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center py-2 border border-champagne text-champagne uppercase tracking-wider text-[11px] hover:bg-champagne hover:text-matte-black transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </aside>
        <main id="main-content" tabIndex={-1} className="outline-none">{children}</main>
      </div>
    </div>
  );
}
