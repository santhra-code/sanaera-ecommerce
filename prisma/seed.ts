import { PrismaClient, RoleName, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../lib/rbac";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles & permissions...");

  const permissionRecords = await Promise.all(
    PERMISSIONS.map((key) =>
      prisma.permission.upsert({ where: { key }, update: {}, create: { key } })
    )
  );
  const permByKey = Object.fromEntries(permissionRecords.map((p) => [p.key, p]));

  for (const roleName of Object.values(RoleName)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    for (const key of ROLE_PERMISSIONS[roleName]) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permByKey[key].id } },
        update: {},
        create: { roleId: role.id, permissionId: permByKey[key].id },
      });
    }
  }

  console.log("Seeding a Super Admin account (change this password immediately)...");
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
  const customerRole = await prisma.role.findUniqueOrThrow({ where: { name: "CUSTOMER" } });

  await prisma.user.upsert({
    where: { email: "admin@sanaera.com" },
    update: {},
    create: {
      firstName: "Sanaera",
      lastName: "Admin",
      email: "admin@sanaera.com",
      passwordHash: await bcrypt.hash("ChangeMe!123", 10),
      roleId: superAdminRole.id,
      isVerified: true,
      emailVerified: new Date(),
    },
  });

  console.log("Seeding categories...");
  const categories = await Promise.all(
    [
      { name: "Sarees", slug: "sarees" },
      { name: "Lehengas", slug: "lehengas" },
      { name: "Suits", slug: "suits" },
      { name: "Dresses", slug: "dresses" },
      { name: "Jewelry", slug: "jewelry" },
    ].map((c) => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  console.log("Seeding collections...");
  const collections = await Promise.all(
    [
      { name: "The Autumn Reverie", slug: "autumn-reverie-2026" },
      { name: "Bridal Collection", slug: "bridal" },
      { name: "Festive Collection", slug: "festive" },
    ].map((c) => prisma.collection.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );
  const colBySlug = Object.fromEntries(collections.map((c) => [c.slug, c]));

  console.log("Seeding products...");
  const products = [
    {
      title: "Meenakari Zari Saree",
      slug: "meenakari-zari-saree",
      sku: "SNR-SAR-0001",
      description: "Hand-embroidered Kanjivaram silk saree with meenakari-inspired zari work.",
      price: 42500,
      categorySlug: "sarees",
      collectionSlug: "autumn-reverie-2026",
      fabric: "Kanjivaram Silk",
      craftRegion: "Tamil Nadu",
      isNewArrival: true,
    },
    {
      title: "Rajwada Bridal Lehenga",
      slug: "rajwada-bridal-lehenga",
      sku: "SNR-LEH-0001",
      description: "Zardozi-embroidered bridal lehenga crafted by the karigars of Jaipur.",
      price: 118000,
      discountPrice: 142000,
      categorySlug: "lehengas",
      collectionSlug: "bridal",
      fabric: "Silk",
      craftRegion: "Jaipur",
      isBestSeller: true,
    },
    {
      title: "Lucknowi Anarkali Suit",
      slug: "lucknowi-anarkali-suit",
      sku: "SNR-SUI-0001",
      description: "Chikankari-embroidered Anarkali suit from Lucknow.",
      price: 28900,
      categorySlug: "suits",
      fabric: "Chikankari Cotton",
      craftRegion: "Lucknow",
      isLimitedEdition: true,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        status: ProductStatus.PUBLISHED,
        categoryId: catBySlug[p.categorySlug].id,
        collectionId: p.collectionSlug ? colBySlug[p.collectionSlug].id : undefined,
        fabric: p.fabric,
        craftRegion: p.craftRegion,
        isNewArrival: p.isNewArrival ?? false,
        isBestSeller: p.isBestSeller ?? false,
        isLimitedEdition: p.isLimitedEdition ?? false,
      },
    });

    for (const size of ["S", "M", "L"]) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: `${p.sku}-${size}` },
        update: {},
        create: {
          productId: product.id,
          size,
          sku: `${p.sku}-${size}`,
        },
      });
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {},
        create: { variantId: variant.id, availableStock: 15, lowStockThreshold: 5 },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
