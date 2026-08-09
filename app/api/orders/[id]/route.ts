import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { title: true, slug: true } }, variant: true } },
      payment: true,
      billingAddress: true,
      shippingAddress: true,
      returnRequests: true,
    },
  });

  // 404, not 403 — don't confirm to a stranger that an order id exists.
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
