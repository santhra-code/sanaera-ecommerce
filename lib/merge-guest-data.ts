import { prisma } from "@/lib/prisma";
import { getGuestSessionId, clearGuestSessionId } from "@/lib/guest-session";

/**
 * Wishlist has no guest-side table (guests use localStorage per the product
 * brief), so there's nothing to merge there — the client is responsible for
 * replaying its localStorage wishlist against POST /api/wishlist once it
 * detects a session. Cart is the one guest-side table that needs merging.
 *
 * Safe to call on every /account load: it's a no-op once the guest cookie
 * is gone, and merging is additive (quantities combine, nothing is lost).
 */
export async function mergeGuestCartIntoUser(userId: string) {
  const guestSessionId = await getGuestSessionId();
  if (!guestSessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { guestSessionId },
    include: { items: true },
  });
  if (!guestCart) {
    await clearGuestSessionId();
    return;
  }

  const userCart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } }); // cascades its items
  await clearGuestSessionId();
}
