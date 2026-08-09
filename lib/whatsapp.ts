/**
 * Pure WhatsApp order-message helpers. Deliberately has ZERO imports from
 * lib/cart.ts or any Prisma-touching module — that's what lets this file
 * be imported from client components (e.g. ProductInfo's "Buy Now" button)
 * without pulling the Prisma client into the browser bundle.
 *
 * Cart-specific mapping (Prisma cart -> these plain shapes) lives in
 * lib/whatsapp-cart.ts instead, which is server-only.
 */

/** Business WhatsApp number orders get sent to, international format. */
const BUSINESS_WHATSAPP_NUMBER = "+919566806456";

export interface WhatsAppOrderItem {
  title: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  /** Already-formatted price, e.g. "₹3,499" — no currency parsing happens here. */
  priceLabel: string;
}

export interface WhatsAppOrderTotals {
  totalItems: number;
  /** Already-formatted total, e.g. "₹9,197". */
  totalAmountLabel: string;
}

/**
 * Builds the order message text sent to the business WhatsApp number.
 * Throws on an empty item list — callers should check for that before
 * calling this.
 */
export function formatOrderMessage(
  items: WhatsAppOrderItem[],
  totals: WhatsAppOrderTotals
): string {
  if (items.length === 0) {
    throw new Error("formatOrderMessage requires at least one item");
  }

  const lines: string[] = [
    "Hello SANAÉRA,",
    "",
    "I would like to place an order.",
    "",
    "Order Details:",
    "",
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.title}${item.color ? ` (${item.color})` : ""}`);
    if (item.size) lines.push(`   Size: ${item.size}`);
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(
      item.quantity > 1
        ? `   Price: ${item.priceLabel} each`
        : `   Price: ${item.priceLabel}`
    );
    lines.push("");
  });

  lines.push("--------------------");
  lines.push(`Total Items: ${totals.totalItems}`);
  lines.push(`Total Amount: ${totals.totalAmountLabel}`);
  lines.push("--------------------");
  lines.push("");
  lines.push("Please confirm my order.");
  lines.push("Thank you.");

  return lines.join("\n");
}

/** Convenience for a single-product "Buy Now" flow (quantity always 1). */
export function formatSingleItemMessage(item: Omit<WhatsAppOrderItem, "quantity">): string {
  return formatOrderMessage(
    [{ ...item, quantity: 1 }],
    { totalItems: 1, totalAmountLabel: item.priceLabel }
  );
}

/**
 * Builds a wa.me deep link. wa.me itself handles the desktop/mobile split
 * (WhatsApp Web on desktop, native app on mobile) — no user-agent
 * sniffing needed on our side.
 */
export function buildWhatsAppUrl(
  message: string,
  phoneNumber: string = BUSINESS_WHATSAPP_NUMBER
): string {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
