import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLowStockAlertEmail } from "@/lib/email";

/**
 * Configured in vercel.json to run daily. Protected by CRON_SECRET so this
 * can't be triggered by an arbitrary request — Vercel Cron sends this
 * header automatically when CRON_SECRET is set as an env var; anyone else
 * calling this URL without it gets a 401.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prisma's query builder can't compare two columns of the same row
  // (availableStock <= lowStockThreshold) directly in a `where` clause, so
  // fetch and filter in JS. Fine at fashion-catalog scale; move to
  // `$queryRaw` if the variant count ever makes this a real cost.
  const allInventory = await prisma.inventory.findMany({
    include: { variant: { include: { product: { select: { title: true } } } } },
  });
  const lowStockVariants = allInventory.filter((inv) => inv.availableStock <= inv.lowStockThreshold);

  if (lowStockVariants.length === 0) {
    return NextResponse.json({ checked: true, lowStockCount: 0 });
  }

  const recipients = await prisma.user.findMany({
    where: { role: { name: { in: ["SUPER_ADMIN", "PRODUCT_MANAGER"] } }, isActive: true },
    select: { email: true },
  });

  const items = lowStockVariants.map((inv) => ({
    productTitle: inv.variant.product.title,
    sku: inv.variant.sku,
    availableStock: inv.availableStock,
    threshold: inv.lowStockThreshold,
  }));

  await Promise.all(recipients.map((r) => sendLowStockAlertEmail(r.email, items)));

  return NextResponse.json({
    checked: true,
    lowStockCount: lowStockVariants.length,
    notified: recipients.length,
  });
}
