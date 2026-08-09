// Server-only: imports lib/cart.ts, which touches the Prisma client.
// Never import this file from a "use client" component — import from
// lib/whatsapp.ts directly instead (see ProductInfo.tsx's Buy Now button).
import type { CartWithItems } from "@/lib/cart";
import { getUnitPrice } from "@/lib/cart";
import {
  formatOrderMessage,
  buildWhatsAppUrl,
  type WhatsAppOrderItem,
} from "@/lib/whatsapp";

function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function buildOrderItemsFromCart(cart: CartWithItems): WhatsAppOrderItem[] {
  return cart.items.map((item) => ({
    title: item.product.title,
    size: item.variant.size,
    color: item.variant.color,
    quantity: item.quantity,
    priceLabel: formatInr(getUnitPrice(item)),
  }));
}

/**
 * Cart -> wa.me URL, in one call. Returns null for an empty cart so the
 * cart page can decide whether to render the button at all.
 */
export function getWhatsAppOrderUrl(
  cart: CartWithItems,
  totals: { totalItems: number; totalAmount: number }
): string | null {
  const items = buildOrderItemsFromCart(cart);
  if (items.length === 0) return null;
  const message = formatOrderMessage(items, {
    totalItems: totals.totalItems,
    totalAmountLabel: formatInr(totals.totalAmount),
  });
  return buildWhatsAppUrl(message);
}
