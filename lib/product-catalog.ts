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
  include: { category: true; collection: true };
}>;

function toFrontendProduct(product: DbProduct): Product {
  const currentPrice = product.discountPrice ?? product.price;
  return {
    slug: product.slug,
    tag: getTag(product),
    category: product.category.name,
    name: product.title,
    price: formatMoney(Number(currentPrice)),
    oldPrice: product.discountPrice ? formatMoney(Number(product.price)) : undefined,
    swatchTheme: getSwatchTheme(product.category.name, product.collection?.name),
  };
}

export async function getProducts() {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true, collection: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  return products.map(toFrontendProduct);
}

export async function getProductBySlug(slug: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, collection: true },
  });
  if (!product || product.status !== "PUBLISHED") return null;
  return toFrontendProduct(product);
}

export function getThemeGradient(theme: Product["swatchTheme"]) {
  return themeGradient[theme];
}
