"use client";

import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const COLUMNS = [
  {
    title: "The House",
    items: [
      { label: "Heritage Story", href: "/heritage" },
      { label: "Our Artisans", href: "/artisan-stories" },
      { label: "Sustainability", href: "/heritage" },
    ],
  },
  {
    title: "Customer Care",
    items: [
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "WhatsApp Shopping", href: buildWhatsAppUrl("Hello SANAÉRA, I have a question about shopping.") },
      { label: "Newsletter", href: "/#newsletter" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-matte-black text-sand px-12 pt-24 pb-8 max-md:px-6 max-md:pt-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-16 border-b border-[rgba(232,216,207,0.14)]">
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
        <span>Order assistance is available through WhatsApp.</span>
      </div>
    </footer>
  );
}
