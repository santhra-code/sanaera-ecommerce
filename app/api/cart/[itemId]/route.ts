import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { getOrCreateCart, setCartItemQuantity, removeCartItem, cartTotals } from "@/lib/cart";
import { cartUpdateSchema } from "@/lib/validations/account";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;
  const { itemId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = cartUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const cart = await getOrCreateCart({ userId: user.id });
  const result = await setCartItemQuantity(cart.id, itemId, parsed.data.quantity);
  if (result === null) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  const updated = await getOrCreateCart({ userId: user.id });
  return NextResponse.json({ cart: updated, totals: cartTotals(updated) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { user, unauthorized } = await requireApiUser();
  if (!user) return unauthorized;
  const { itemId } = await params;

  const cart = await getOrCreateCart({ userId: user.id });
  const result = await removeCartItem(cart.id, itemId);
  if (result === null) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  const updated = await getOrCreateCart({ userId: user.id });
  return NextResponse.json({ cart: updated, totals: cartTotals(updated) });
}
