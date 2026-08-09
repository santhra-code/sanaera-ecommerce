export type Product = {
  slug: string;
  tag: "New" | "Bestseller" | "Limited" | "Featured";
  category: string;
  name: string;
  price: string;
  oldPrice?: string;
  swatchTheme: "emerald" | "maroon" | "charcoal" | "champagne";
};

export const themeGradient: Record<Product["swatchTheme"], string> = {
  emerald: "linear-gradient(160deg,#441629,#2D0C1C)",
  maroon: "linear-gradient(160deg,#381222,#1a0610)",
  charcoal: "linear-gradient(160deg,#2D0C1C,#1a0610)",
  champagne: "linear-gradient(160deg,#DEB092,#C88F73)",
};
