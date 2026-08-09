import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;
  const { itemId } = await params;

  const item = await prisma.wishlistItem.findUnique({
    where: { id: itemId },
    include: { wishlist: true },
  });
  if (!item || item.wishlist.userId !== user.id) {
    return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
  }

  await prisma.wishlistItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
