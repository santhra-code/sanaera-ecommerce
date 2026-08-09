import type { Metadata } from "next";
import { Cormorant_Garamond, Marcellus_SC, Jost } from "next/font/google";
import "./globals.css";
import IntroAnimation from "@/components/IntroAnimation";
import SmoothScroll from "@/components/SmoothScroll";
import AuthSessionProvider from "@/components/AuthSessionProvider";

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
          <IntroAnimation brandName="SANAÉRA" tagline="Luxury. Heritage. Elegance." />
          <SmoothScroll>{children}</SmoothScroll>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
