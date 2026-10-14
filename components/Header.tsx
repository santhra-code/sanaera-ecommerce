"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useShop } from "./ShopContext";

type MegaKey = "new" | "collections" | "heritage";

const MEGA_CONTENT: Record<
  MegaKey,
  { columns: { title: string; items: { label: string; href: string }[] }[]; caption: string }
> = {
  new: {
    columns: [
      {
        title: "Just In",
        items: [
          { label: "New Arrivals", href: "/new-arrivals" },
          { label: "This Week", href: "/new-arrivals" },
          { label: "Pre-Order", href: "/new-arrivals" },
          { label: "Limited Edition", href: "/collections" },
        ],
      },
      {
        title: "Ready to Wear",
        items: [
          { label: "Sarees", href: "/collections" },
          { label: "Lehengas", href: "/collections" },
          { label: "Suits", href: "/collections" },
          { label: "Dresses", href: "/collections" },
        ],
      },
      {
        title: "Occasion",
        items: [
          { label: "Bridal", href: "/collections" },
          { label: "Festive", href: "/collections" },
          { label: "Evening", href: "/collections" },
          { label: "Everyday Luxe", href: "/collections" },
        ],
      },
    ],
    caption: "The July Edit",
  },
  collections: {
    columns: [
      {
        title: "By Fabric",
        items: [
          { label: "Kanjivaram Silk", href: "/collections" },
          { label: "Banarasi", href: "/collections" },
          { label: "Chikankari", href: "/collections" },
          { label: "Handloom Cotton", href: "/collections" },
        ],
      },
      {
        title: "By State",
        items: [
          { label: "Gujarat — Bandhani", href: "/collections" },
          { label: "Varanasi — Silk", href: "/collections" },
          { label: "Lucknow — Chikankari", href: "/collections" },
          { label: "Kashmir — Pashmina", href: "/collections" },
        ],
      },
      {
        title: "Seasonal",
        items: [
          { label: "Festive Collection", href: "/collections" },
          { label: "Wedding Collection", href: "/collections" },
          { label: "Resort '26", href: "/collections" },
          { label: "Best Sellers", href: "/collections" },
        ],
      },
    ],
    caption: "Shop by State",
  },
  heritage: {
    columns: [
      {
        title: "The House",
        items: [
          { label: "Our Story", href: "/heritage" },
          { label: "Artisan Network", href: "/artisan-stories" },
          { label: "Sustainability", href: "/heritage" },
          { label: "Craftsmanship", href: "/heritage" },
        ],
      },
      {
        title: "Journal",
        items: [
          { label: "Fashion Journal", href: "/heritage" },
          { label: "Celebrity Style", href: "/heritage" },
          { label: "Behind the Loom", href: "/artisan-stories" },
          { label: "Press", href: "/heritage" },
        ],
      },
      {
        title: "Services",
        items: [
          { label: "Bridal Appointments", href: "/heritage" },
          { label: "Video Consultation", href: "/heritage" },
          { label: "Live Shopping", href: "/heritage" },
          { label: "Loyalty Circle", href: "/heritage" },
        ],
      },
    ],
    caption: "Woven Since 1998",
  },
};

const NAV = [
  { key: "new" as MegaKey, label: "New Arrivals", href: "/new-arrivals" },
  { key: "collections" as MegaKey, label: "Collections", href: "/collections" },
  { key: "heritage" as MegaKey, label: "Heritage", href: "/heritage" },
];

import SearchModal from "./SearchModal";

function NavLink({
  href,
  children,
  onMouseEnter,
  onFocus,
}: {
  href: string;
  children: React.ReactNode;
  onMouseEnter?: () => void;
  onFocus?: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      className="relative text-[13px] tracking-[0.06em] uppercase font-normal py-1.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
    >
      {children}
      <span className="absolute left-0 bottom-0 h-px w-0 bg-champagne transition-[width] duration-[350ms] ease-out group-hover:w-full" />
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMega, setOpenMega] = useState<MegaKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, wishlistCount } = useShop();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / '/' for search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpenMega(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[900] flex items-center justify-between px-12 max-md:px-6 transition-all duration-500 ${
          scrolled
            ? "bg-[rgba(45,12,28,0.78)] backdrop-blur-xl border-b border-line py-4"
            : "border-b border-transparent py-[26px]"
        }`}
        onMouseLeave={() => setOpenMega(null)}
      >
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.32em] text-warmwhite focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne"
        >
          SANAÉRA
        </Link>

        <nav className="hidden md:flex gap-9 items-center" aria-label="Main Navigation">
          {NAV.map((item) => (
            <div key={item.key} className="relative">
              <NavLink
                href={item.href}
                onMouseEnter={() => setOpenMega(item.key)}
                onFocus={() => setOpenMega(item.key)}
              >
                {item.label}
              </NavLink>
            </div>
          ))}
          <NavLink href="/jewelry">Jewelry</NavLink>
          <NavLink href="/artisan-stories">Artisan Stories</NavLink>
        </nav>

        <div className="hidden md:flex gap-[22px] items-center text-[13px]">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="cursor-pointer opacity-85 hover:opacity-100 hover:text-champagne transition-opacity uppercase tracking-wider text-[12px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne py-1"
            aria-label="Open search catalog"
          >
            <span>Search</span>
            <kbd className="hidden lg:inline text-[10px] text-text-secondary/70 border border-line px-1 py-0.5 rounded-sm">
              /
            </kbd>
          </button>
          <Link
            href="/account/wishlist"
            className="opacity-85 hover:opacity-100 hover:text-champagne transition-opacity flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-champagne py-1"
          >
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          <Link
            href="/account/cart"
            className="opacity-85 hover:opacity-100 hover:text-champagne transition-opacity flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-champagne py-1"
          >
            Bag ({cartCount})
          </Link>
          <Link
            href="/account"
            className="opacity-85 hover:opacity-100 hover:text-champagne transition-opacity focus-visible:ring-1 focus-visible:ring-champagne py-1"
          >
            Profile
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          className="hidden max-md:flex flex-col gap-[5px] cursor-pointer text-warmwhite p-2 focus-visible:ring-1 focus-visible:ring-champagne"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span className="w-[22px] h-px bg-current" aria-hidden="true" />
          <span className="w-[22px] h-px bg-current" aria-hidden="true" />
          <span className="w-[22px] h-px bg-current" aria-hidden="true" />
        </button>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile Navigation"
            className="hidden max-md:flex flex-col fixed top-16 left-0 right-0 bg-emerald-deep px-6 py-5 z-[800] gap-1 border-b border-line shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="py-2.5 text-[13px] uppercase tracking-wide text-left text-champagne"
            >
              🔍 Search Collection
            </button>
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-[13px] uppercase tracking-wide text-warmwhite hover:text-champagne"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/jewelry"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-[13px] uppercase tracking-wide text-warmwhite hover:text-champagne"
            >
              Jewelry
            </Link>
            <Link
              href="/artisan-stories"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-[13px] uppercase tracking-wide text-warmwhite hover:text-champagne"
            >
              Artisan Stories
            </Link>
          </nav>
        )}

        {/* Mega menu panels — one per nav item, matching the HTML's 3 distinct panels */}
        {(Object.keys(MEGA_CONTENT) as MegaKey[]).map((key) => {
          const mega = MEGA_CONTENT[key];
          return (
            <div
              key={key}
              role="region"
              aria-label={`${key} navigation menu`}
              className={`fixed inset-x-0 top-0 grid grid-cols-4 gap-10 border-b border-line bg-emerald-deep/98 backdrop-blur-xl px-12 pt-32 pb-12 transition-all duration-500 ${
                openMega === key
                  ? "translate-y-0 opacity-100 pointer-events-auto"
                  : "-translate-y-full opacity-0 pointer-events-none"
              }`}
            >
              {mega.columns.map((col) => (
                <MegaColumn key={col.title} title={col.title} items={col.items} />
              ))}
              <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-emerald to-emerald-deep">
                <span className="absolute bottom-4 left-4 font-display italic text-lg text-warmwhite">
                  {mega.caption}
                </span>
              </div>
            </div>
          );
        })}
      </header>

      {/* Accessible Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}

function MegaColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-label text-xs tracking-[0.2em] uppercase text-antique-gold mb-4">
        {title}
      </h4>
      <ul>
        {items.map((i) => (
          <li key={i.label}>
            <Link
              href={i.href}
              className="block font-display text-[19px] py-1.5 hover:text-maroon hover:pl-1.5 transition-all cursor-pointer"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
