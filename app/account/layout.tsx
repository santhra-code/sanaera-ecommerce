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
  // Belt and suspenders: middleware already gates /account, but a layout
  // that assumes `session.user` exists without checking is one refactor
  // away from a crash (or worse, a leaked page) if that guarantee ever slips.
  if (!session?.user) redirect("/login?callbackUrl=/account");

  await mergeGuestCartIntoUser(session.user.id);

  return (
    <div className="min-h-screen bg-ivory pt-[110px] px-6 md:px-12 pb-24">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-[220px_1fr] gap-12">
        <aside>
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.12em] text-text-secondary">
              Signed in as
            </div>
            <div className="font-display text-lg text-warmwhite truncate">
              {session.user.name}
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
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
