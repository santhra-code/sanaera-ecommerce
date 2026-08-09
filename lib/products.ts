export type Product = {
  slug: string;
  tag: string;
  category: string;
  name: string;
  price: string;
  oldPrice?: string;
  swatchTheme: "emerald" | "maroon" | "charcoal" | "champagne";
};

export const products: Product[] = [
  { slug: "meenakari-zari-saree", tag: "New", category: "Saree · Kanjivaram Silk", name: "Meenakari Zari Saree", price: "₹42,500", swatchTheme: "emerald" },
  { slug: "rajwada-bridal-lehenga", tag: "Bestseller", category: "Lehenga · Bridal", name: "Rajwada Bridal Lehenga", price: "₹1,18,000", oldPrice: "₹1,42,000", swatchTheme: "maroon" },
  { slug: "lucknowi-anarkali-suit", tag: "Limited", category: "Suit · Chikankari", name: "Lucknowi Anarkali Suit", price: "₹28,900", swatchTheme: "charcoal" },
  { slug: "zardozi-brocade-saree", tag: "New", category: "Saree · Banarasi", name: "Zardozi Brocade Saree", price: "₹56,000", swatchTheme: "champagne" },
  { slug: "ikat-cape-gown", tag: "Festive", category: "Dress · Handloom", name: "Ikat Cape Gown", price: "₹34,750", swatchTheme: "emerald" },
  { slug: "bandhani-ghagra-set", tag: "Bestseller", category: "Lehenga · Festive", name: "Bandhani Ghagra Set", price: "₹64,200", swatchTheme: "maroon" },
  { slug: "kashmiri-embroidered-kurta", tag: "New", category: "Suit · Pashmina", name: "Kashmiri Embroidered Kurta", price: "₹31,000", swatchTheme: "charcoal" },
  { slug: "temple-border-silk-saree", tag: "Limited", category: "Saree · Kanjivaram", name: "Temple Border Silk Saree", price: "₹48,900", swatchTheme: "champagne" },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const themeGradient: Record<Product["swatchTheme"], string> = {
  emerald: "linear-gradient(160deg,#441629,#2D0C1C)",
  maroon: "linear-gradient(160deg,#381222,#1a0610)",
  charcoal: "linear-gradient(160deg,#2D0C1C,#1a0610)",
  champagne: "linear-gradient(160deg,#DEB092,#C88F73)",
};
