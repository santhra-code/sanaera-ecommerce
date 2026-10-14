import type { Metadata } from "next";
import { Cormorant_Garamond, Marcellus_SC, Jost } from "next/font/google";
import "./globals.css";
import IntroAnimation from "@/components/IntroAnimation";
import SmoothScroll from "@/components/SmoothScroll";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { ShopProvider } from "@/components/ShopContext";
import ToastNotification from "@/components/ToastNotification";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const label = Marcellus_SC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-label",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "SANAÉRA — Where India's Heritage Meets Modern Luxury",
  description:
    "SANAÉRA is a luxury Indian fashion house — sarees, lehengas, and heirloom craftsmanship reimagined for the modern world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${label.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <AuthSessionProvider>
          <ShopProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2.5 focus:bg-champagne focus:text-matte-black focus:font-medium focus:text-xs focus:uppercase focus:tracking-[0.14em] focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-warmwhite"
            >
              Skip to main content
            </a>
            <IntroAnimation brandName="SANAÉRA" tagline="Luxury. Heritage. Elegance." />
            <SmoothScroll>{children}</SmoothScroll>
            <ToastNotification />
          </ShopProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
