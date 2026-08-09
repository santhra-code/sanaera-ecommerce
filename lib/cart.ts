import { prisma } from "@/lib/prisma";

export async function getOrCreateCart({
  userId,
  guestSessionId,
}: {
  userId?: string;
  guestSessionId?: string;
}) {
  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: cartInclude,
    });
  }
  if (guestSessionId) {
    return prisma.cart.upsert({
      where: { guestSessionId },
      update: {},
      create: { guestSessionId },
      include: cartInclude,
    });
  }
  throw new Error("getOrCreateCart requires a userId or guestSessionId");
}

const cartInclude = {
  items: {
    include: {
      product: { select: { id: true, title: true, slug: true, price: true, discountPrice: true } },
      variant: { select: { id: true, size: true, color: true, price: true } },
    },
    orderBy: { addedAt: "asc" as const },
  },
};

/** Convenience types — reused by lib/whatsapp.ts so it stays decoupled from Prisma call sites. */
export type CartWithItems = Awaited<ReturnType<typeof getOrCreateCart>>;
export type CartItemWithRelations = CartWithItems["items"][number];

/**
 * Single source of truth for "what does this line item actually cost":
 * variant price wins if set, else the product's discount price, else its
 * base price. Used by cartTotals below and by the WhatsApp order message.
 */
export function getUnitPrice(item: CartItemWithRelations): number {
  return Number(item.variant.price ?? item.product.discountPrice ?? item.product.price);
}

export function cartTotals(cart: CartWithItems) {
  let subtotal = 0;
  let itemCount = 0;
  for (const item of cart.items) {
    subtotal += getUnitPrice(item) * item.quantity;
    itemCount += item.quantity;
  }
  return { subtotal, itemCount };
}

export async function addItemToCart(
  cartId: string,
  { productId, variantId, quantity }: { productId: string; variantId: string; quantity: number }
) {
  // Guard against overselling: cap at available (not reserved-by-others) stock.
  const inventory = await prisma.inventory.findUnique({ where: { variantId } });
  const available = inventory?.availableStock ?? 0;

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });
  const desiredQuantity = (existing?.quantity ?? 0) + quantity;
  const clampedQuantity = Math.max(1, Math.min(desiredQuantity, available || desiredQuantity));

  return prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    update: { quantity: clampedQuantity },
    create: { cartId, productId, variantId, quantity: clampedQuantity },
  });
}

export async function setCartItemQuantity(cartId: string, itemId: string, quantity: number) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cartId) return null; // ownership check

  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }

  const inventory = await prisma.inventory.findUnique({ where: { variantId: item.variantId } });
  const available = inventory?.availableStock ?? quantity;
  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: Math.min(quantity, available || quantity) },
  });
}

export async function removeCartItem(cartId: string, itemId: string) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.cartId !== cartId) return null; // ownership check
  return prisma.cartItem.delete({ where: { id: itemId } });
}
