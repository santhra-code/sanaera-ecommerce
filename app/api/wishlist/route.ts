import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { wishlistAddSchema } from "@/lib/validations/account";

const wishlistInclude = {
  items: {
    include: {
      product: {
        select: { id: true, title: true, slug: true, price: true, discountPrice: true },
      },
      variant: { select: { id: true, size: true, color: true } },
    },
    orderBy: { addedAt: "desc" as const },
  },
};

export async function GET() {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    include: wishlistInclude,
  });
  return NextResponse.json({ wishlist });
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = wishlistAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId: parsed.data.productId,
      variantId: parsed.data.variantId ?? null,
    },
  });

  if (!existingItem) {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: parsed.data.productId,
        variantId: parsed.data.variantId,
      },
    });
  }

  const updated = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    include: wishlistInclude,
  });
  return NextResponse.json({ wishlist: updated }, { status: 201 });
}