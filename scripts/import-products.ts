import fs from "fs/promises";
import path from "path";
import { slugify } from "../lib/validations/product";
import type { ProductStatus } from "@prisma/client";

let prisma: typeof import("../lib/prisma").prisma;

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!(await fileExists(envPath))) {
    return;
  }

  const file = await fs.readFile(envPath, "utf8");
  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function initializePrisma() {
  await loadDotEnv();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Create a .env file with DATABASE_URL before running the import.");
  }
  const imported = await import("../lib/prisma");
  prisma = imported.prisma;
}

interface ImportImage {
  source?: string;
  url?: string;
  publicId?: string;
  alt?: string;
  position?: number;
}

interface ImportVariant {
  size?: string;
  color?: string;
  sku: string;
  price?: number;
  availableStock?: number;
  lowStockThreshold?: number;
}

export interface ImportProduct {
  title: string;
  slug?: string;
  description: string;
  price: number;
  discountPrice?: number;
  sku: string;
  barcode?: string;
  category: string;
  collection?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isLimitedEdition?: boolean;
  fabric?: string;
  occasion?: string;
  craftRegion?: string;
  seoTitle?: string;
  seoDescription?: string;
  images?: ImportImage[];
  variants?: ImportVariant[];
}

interface CliOptions {
  file: string;
  dryRun: boolean;
}

function parseArgs(): CliOptions {
  const entries = process.argv.slice(2);
  const options: Record<string, string | boolean> = {};

  for (const raw of entries) {
    const [key, value] = raw.startsWith("--") ? raw.slice(2).split("=") : [raw, "true"];
    options[key] = value ?? true;
  }

  if (!options.file) {
    throw new Error("Missing required --file argument. Example: --file=data/import-products.json");
  }

  return {
    file: String(options.file),
    dryRun: options["dry-run"] === true || options["dryrun"] === true || options["dry_run"] === true,
  };
}

function isLocalPath(value: string) {
  return value.startsWith(".") || value.startsWith("/") || /^[a-zA-Z]:\\/.test(value);
}

async function resolveCategory(name: string) {
  const normalized = name.trim();
  const slug = slugify(normalized);
  let category = await prisma.category.findFirst({
    where: {
      OR: [{ slug }, { name: { equals: normalized, mode: "insensitive" } }],
    },
  });

  if (!category) {
    category = await prisma.category.create({ data: { name: normalized, slug } });
    console.log(`Created category: ${category.name}`);
  }

  return category;
}

async function resolveCollection(name: string | undefined) {
  if (!name) return null;
  const normalized = name.trim();
  const slug = slugify(normalized);
  let collection = await prisma.collection.findFirst({
    where: {
      OR: [{ slug }, { name: { equals: normalized, mode: "insensitive" } }],
    },
  });

  if (!collection) {
    collection = await prisma.collection.create({
      data: { name: normalized, slug, isActive: true },
    });
    console.log(`Created collection: ${collection.name}`);
  }

  return collection;
}

async function resolveImage(image: ImportImage, productSlug: string) {
  const source = image.source ?? image.url;
  if (!source && !image.publicId) {
    throw new Error("Image entry must include either source or url");
  }

  const position = image.position ?? 0;
  let url = image.url ?? "";
  let publicId = image.publicId;

  if (!url && source) {
    if (isLocalPath(source)) {
      const resolvedSource = path.isAbsolute(source) ? source : path.join(process.cwd(), source);
      const normalized = path.normalize(resolvedSource);
      const publicFolder = path.normalize(path.join(process.cwd(), "public"));
      if (!normalized.startsWith(publicFolder)) {
        throw new Error("Local image source must be inside the public folder when Cloudinary is not configured.");
      }
      url = "/" + path.relative(publicFolder, normalized).replace(/\\\\/g, "/");
    } else {
      url = source;
    }
  }

  if (!publicId) {
    publicId = `local-${productSlug}-${position}`;
  }

  return {
    url,
    publicId,
    alt: image.alt ?? "",
    position,
  };
}

async function importProduct(item: ImportProduct, options: CliOptions) {
  const slug = item.slug?.trim() ? item.slug.trim() : slugify(item.title);
  const category = await resolveCategory(item.category);
  const collection = await resolveCollection(item.collection);

  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  const existingSku = await prisma.product.findUnique({ where: { sku: item.sku } });

  if (existingSlug || existingSku) {
    console.warn(`Skipping product ${slug}: already exists by ${existingSlug ? "slug" : "sku"}.`);
    return;
  }

  const images = (item.images ?? []).map((img, index) => ({
    ...img,
    position: img.position ?? index,
  }));

  const variants = (item.variants && item.variants.length > 0
    ? item.variants
    : [{ sku: item.sku, availableStock: 0, lowStockThreshold: 5 }]
  ).map((variant) => ({
    size: variant.size?.trim() || null,
    color: variant.color?.trim() || null,
    sku: variant.sku,
    price: variant.price ?? null,
    availableStock: variant.availableStock ?? 0,
    lowStockThreshold: variant.lowStockThreshold ?? 5,
  }));

  const imageUploads = options.dryRun
    ? images.map((img) => ({
        url: img.url ?? img.source ?? "<pending>",
        publicId: img.publicId ?? `pending-${slug}-${img.position ?? 0}`,
        alt: img.alt ?? "",
        position: img.position ?? 0,
      }))
    : await Promise.all(images.map((img) => resolveImage(img, slug)));

  if (options.dryRun) {
    console.log(`Dry run: would create product ${slug} with ${imageUploads.length} image(s) and ${variants.length} variant(s).`);
    return;
  }

  await prisma.product.create({
    data: {
      title: item.title.trim(),
      slug,
      description: item.description.trim(),
      price: item.price,
      discountPrice: item.discountPrice ?? null,
      sku: item.sku.trim(),
      barcode: item.barcode?.trim() || null,
      categoryId: category.id,
      collectionId: collection?.id || null,
      status: item.status ?? "PUBLISHED",
      isFeatured: item.isFeatured ?? false,
      isNewArrival: item.isNewArrival ?? false,
      isTrending: item.isTrending ?? false,
      isBestSeller: item.isBestSeller ?? false,
      isLimitedEdition: item.isLimitedEdition ?? false,
      fabric: item.fabric?.trim() || null,
      occasion: item.occasion?.trim() || null,
      craftRegion: item.craftRegion?.trim() || null,
      seoTitle: item.seoTitle?.trim() || null,
      seoDescription: item.seoDescription?.trim() || null,
      images: {
        create: imageUploads.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.alt || null,
          position: img.position,
        })),
      },
      variants: {
        create: variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
          price: variant.price,
          inventory: {
            create: {
              availableStock: variant.availableStock,
              lowStockThreshold: variant.lowStockThreshold,
            },
          },
        })),
      },
    },
  });

  console.log(`Imported product ${slug}`);
}

async function main() {
  await initializePrisma();
  const options = parseArgs();
  const filePath = path.isAbsolute(options.file) ? options.file : path.join(process.cwd(), options.file);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as ImportProduct[];

  if (!Array.isArray(parsed)) {
    throw new Error("Import file must contain a top-level array of products.");
  }

  console.log(`Importing ${parsed.length} product(s) from ${filePath}${options.dryRun ? " (dry run)" : ""}...`);

  for (const item of parsed) {
    await importProduct(item, options);
  }

  console.log("Import complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
