import fs from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

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
  if (!(await fileExists(envPath))) return;

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

async function main() {
  await loadDotEnv();
  prisma = new PrismaClient();
  // Create or find a category to attach the product to
  const category = await prisma.category.upsert({
    where: { slug: "import-test" },
    update: {},
    create: {
      name: "Import Test",
      slug: "import-test",
      description: "Temporary category for import testing",
    },
  });

  const sku = `TEST-SKU-${Date.now()}`;

  const product = await prisma.product.create({
    data: {
      title: "Test Product from Script",
      slug: `test-product-${Date.now()}`,
      description: "This product was created by scripts/test-create-product.ts for verification.",
      price: 199.99,
      sku,
      barcode: "",
      categoryId: category.id,
      status: "PUBLISHED",
      images: {
        create: [
          {
            url: "/products/test-product-1.jpg",
            publicId: "local/test-product-1.jpg",
            alt: "Test product image",
            position: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku,
            size: "M",
            color: "Natural",
            price: 199.99,
            inventory: {
              create: {
                availableStock: 10,
                lowStockThreshold: 2,
              },
            },
          },
        ],
      },
    },
    include: { images: true, variants: true },
  });

  console.log("Created product:", { id: product.id, slug: product.slug });

  const published = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    take: 10,
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${published.length} published products (most recent up to 10):`);
  for (const p of published) {
    console.log({ id: p.id, slug: p.slug, title: p.title, images: p.images.map((i) => i.url) });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect().then(() => process.exit(1));
});
