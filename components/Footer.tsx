"use client";

import Link from "next/link";

const COLUMNS = [
  {
    title: "The House",
    items: [
      { label: "Heritage Story", href: "/heritage" },
      { label: "Our Artisans", href: "/artisan-stories" },
      { label: "Sustainability", href: "/heritage" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Bridal Appointments", href: "#" },
      { label: "Video Consultation", href: "#" },
      { label: "Live Shopping", href: "#" },
      { label: "Gift Cards", href: "#" },
    ],
  },
  {
    title: "Customer Care",
    items: [
      { label: "Contact Us", href: "#" },
      { label: "Global Shipping", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Size Guide", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "WhatsApp Shopping", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Newsletter", href: "#" },
      { label: "Store Locator", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-matte-black text-sand px-12 pt-24 pb-8 max-md:px-6 max-md:pt-20">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-16 border-b border-[rgba(232,216,207,0.14)]">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="font-display text-warmwhite text-xl tracking-[0.2em] block mb-4">
            SANAÉRA
          </Link>
          <p className="text-[13px] leading-[1.9] text-[rgba(232,216,207,0.75)] max-w-[32ch]">
            A luxury house rooted in Indian craftsmanship, dressing the modern world in heritage
            worth remembering.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-label text-[11px] tracking-[0.16em] uppercase text-champagne mb-5">
              {col.title}
            </h4>
            <ul>
              {col.items.map((item) => (
                <li
                  key={item.label}
                  className="text-[13.5px] py-1.5 text-[rgba(232,216,207,0.75)] hover:text-warmwhite hover:pl-1 transition-all cursor-pointer"
                >
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-7 text-[11.5px] text-[rgba(232,216,207,0.5)] flex-wrap gap-4">
        <span>© 2026 SANAÉRA House of Craft. All rights reserved.</span>
        <div className="flex gap-5">
          {["Instagram", "Pinterest", "WhatsApp"].map((s) => (
            <span key={s} className="uppercase tracking-wide hover:text-champagne cursor-pointer">
              {s}
            </span>
          ))}
        </div>
        <div>Visa · Mastercard · Amex · UPI · PayPal</div>
      </div>
    </footer>
  );
}
