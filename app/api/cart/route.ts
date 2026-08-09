import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { getOrCreateCart, addItemToCart, cartTotals } from "@/lib/cart";
import { cartAddSchema } from "@/lib/validations/account";

export async function GET() {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;

  const cart = await getOrCreateCart({ userId: user.id });
  return NextResponse.json({ cart, totals: cartTotals(cart) });
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = cartAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const cart = await getOrCreateCart({ userId: user.id });
  await addItemToCart(cart.id, parsed.data);

  const updated = await getOrCreateCart({ userId: user.id });
  return NextResponse.json({ cart: updated, totals: cartTotals(updated) }, { status: 201 });
}
