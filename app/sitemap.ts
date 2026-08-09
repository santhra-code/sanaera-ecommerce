import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sanaera.com";

function isBuildTime() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_BUILD_ID !== undefined ||
    process.env.npm_lifecycle_event === "build"
  );
}

// Static marketing routes. Product/category/collection URLs are appended
// below from the database. /admin and /account are never listed here —
// robots.ts also disallows them, but a sitemap is the more common way
// people actually discover URLs, so leaving them out here matters more.
const STATIC_ROUTES = [
  "",
  "/new-arrivals",
  "/collections",
  "/heritage",
  "/jewelry",
  "/artisan-stories",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const products = isBuildTime()
    ? []
    : await prisma.product
        .findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        })
        .catch(() => []); // don't fail the whole sitemap if the DB is unreachable at runtime

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticEntries, ...productEntries];
}
