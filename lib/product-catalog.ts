import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { themeGradient, type Product } from "@/lib/products";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatMoney(value: number) {
  return currencyFormatter.format(value);
}

function getTag(product: {
  isNewArrival: boolean;
  isBestSeller: boolean;
  isLimitedEdition: boolean;
  isFeatured: boolean;
}) {
  if (product.isNewArrival) return "New";
  if (product.isBestSeller) return "Bestseller";
  if (product.isLimitedEdition) return "Limited";
  return "Featured";
}

function getSwatchTheme(category: string, collection?: string) {
  const normalized = category.toLowerCase();
  const collectionName = collection?.toLowerCase() ?? "";

  if (normalized.includes("saree") || collectionName.includes("festive")) return "emerald";
  if (normalized.includes("lehenga") || collectionName.includes("bridal")) return "maroon";
  if (normalized.includes("suit")) return "charcoal";
  if (normalized.includes("jewelry")) return "champagne";
  return "champagne";
}

type DbProduct = Prisma.ProductGetPayload<{
  include: { category: true; collection: true; images: true };
}>;

function toFrontendProduct(product: DbProduct): Product {
  const currentPrice = product.discountPrice ?? product.price;
  const images = product.images
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      url: image.url,
      alt: image.alt ?? product.title,
      position: image.position,
    }));

  return {
    slug: product.slug,
    tag: getTag(product),
    category: product.category.name,
    name: product.title,
    price: formatMoney(Number(currentPrice)),
    oldPrice: product.discountPrice ? formatMoney(Number(product.price)) : undefined,
    swatchTheme: getSwatchTheme(product.category.name, product.collection?.name),
    images,
  };
}

export const FALLBACK_PRODUCTS: Product[] = [
  {
    slug: "meenakari-zari-saree",
    tag: "New",
    category: "Sarees",
    name: "Meenakari Zari Saree",
    price: "₹42,500",
    swatchTheme: "emerald",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
        alt: "Meenakari Zari Saree in rich jewel tones with silver-gilt weaving",
        position: 0,
      },
    ],
  },
  {
    slug: "rajwada-bridal-lehenga",
    tag: "Bestseller",
    category: "Lehengas",
    name: "Rajwada Bridal Lehenga",
    price: "₹1,18,000",
    oldPrice: "₹1,42,000",
    swatchTheme: "maroon",
    images: [
      {
        url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
        alt: "Rajwada Bridal Lehenga with handcrafted zardozi embroidery",
        position: 0,
      },
    ],
  },
  {
    slug: "lucknowi-anarkali-suit",
    tag: "Limited",
    category: "Suits",
    name: "Lucknowi Anarkali Suit",
    price: "₹28,900",
    swatchTheme: "champagne",
    images: [
      {
        url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=900&q=80",
        alt: "Pure cotton chikankari anarkali suit hand-sewn in Awadh",
        position: 0,
      },
    ],
  },
  {
    slug: "varanasi-brocade-saree",
    tag: "Featured",
    category: "Sarees",
    name: "Varanasi Brocade Silk Saree",
    price: "₹54,000",
    swatchTheme: "maroon",
    images: [
      {
        url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
        alt: "Heirloom Banarasi brocade silk saree with floral kadhwa borders",
        position: 0,
      },
    ],
  },
  {
    slug: "chandrika-polki-choker",
    tag: "New",
    category: "Jewelry",
    name: "Chandrika Polki Choker",
    price: "₹34,500",
    swatchTheme: "champagne",
    images: [
      {
        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
        alt: "Uncut polki necklace with fresh-water pearls and meenakari reverse",
        position: 0,
      },
    ],
  },
  {
    slug: "kashmir-pashmina-shawl",
    tag: "Limited",
    category: "Heritage",
    name: "Kashmiri Sozni Pashmina Shawl",
    price: "₹38,000",
    oldPrice: "₹45,000",
    swatchTheme: "charcoal",
    images: [
      {
        url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=900&q=80",
        alt: "Hand-spun pure cashmere shawl with needlework sozni embroidery",
        position: 0,
      },
    ],
  },
];

export async function getProducts(): Promise<Product[]> {
  if (!hasDatabaseUrl()) {
    return process.env.NODE_ENV === "production" ? [] : FALLBACK_PRODUCTS;
  }

  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true, collection: true, images: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
    if (!products.length) return process.env.NODE_ENV === "production" ? [] : FALLBACK_PRODUCTS;
    return products.map(toFrontendProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    if (process.env.NODE_ENV === "production") throw error;
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDatabaseUrl()) {
    return process.env.NODE_ENV === "production"
      ? null
      : FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, collection: true, images: true },
    });
    if (!product || product.status !== "PUBLISHED") {
      return process.env.NODE_ENV === "production"
        ? null
        : FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
    }
    return toFrontendProduct(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    if (process.env.NODE_ENV === "production") throw error;
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export function getThemeGradient(theme: Product["swatchTheme"]) {
  return themeGradient[theme];
}
