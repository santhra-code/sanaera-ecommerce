import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { placedAt: "desc" },
    include: {
      items: { include: { product: { select: { title: true, slug: true } } } },
      payment: { select: { status: true, method: true } },
    },
  });
  return NextResponse.json({ orders });
}
