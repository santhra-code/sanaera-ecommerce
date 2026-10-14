"use client";

import Link from "next/link";
import { useShop } from "@/components/ShopContext";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function CartView({ dbCart }: { dbCart?: any }) {
  const { cart, removeFromCart, updateCartQuantity, cartSubtotal, cartCount } = useShop();

  // If dbCart items exist, show them; otherwise fallback to ShopContext cart
  const hasDbItems = dbCart && dbCart.items && dbCart.items.length > 0;
  const isCartEmpty = !hasDbItems && cart.length === 0;

  const displayCount = hasDbItems ? dbCart.items.reduce((acc: number, item: any) => acc + item.quantity, 0) : cartCount;

  // Build WhatsApp order URL for client cart items
  const formatCartMessage = () => {
    let msg = `*SANAÉRA Bag Order*\n\n`;
    if (hasDbItems) {
      dbCart.items.forEach((item: any, idx: number) => {
        msg += `${idx + 1}. *${item.product.title}*\n`;
        msg += `   - Variant: ${[item.variant.size, item.variant.color].filter(Boolean).join(" / ") || "Default"}\n`;
        msg += `   - Qty: ${item.quantity}\n\n`;
      });
    } else {
      cart.forEach((item, idx) => {
        msg += `${idx + 1}. *${item.name}*\n`;
        msg += `   - Size: ${item.size} | Color: ${item.colorName}\n`;
        msg += `   - Qty: ${item.quantity} | Price: ${item.price}\n\n`;
      });
      msg += `*Subtotal:* ₹${cartSubtotal.toLocaleString("en-IN")}\n`;
    }
    msg += `Please help me complete this order!`;
    return msg;
  };

  const whatsAppUrl = buildWhatsAppUrl(formatCartMessage());

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">
        Bag {displayCount > 0 && <span className="text-text-secondary text-lg">({displayCount})</span>}
      </h1>

      {isCartEmpty ? (
        <p className="text-sm text-text-secondary">
          Your bag is empty.{" "}
          <Link href="/new-arrivals" className="text-champagne hover:underline">
            Continue shopping →
          </Link>
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-px bg-line mb-8">
            {hasDbItems
              ? dbCart.items.map((item: any) => {
                  const unitPrice = Number(
                    item.variant.price ?? item.product.discountPrice ?? item.product.price
                  );
                  return (
                    <div key={item.id} className="bg-emerald-deep px-6 py-5 flex justify-between items-center">
                      <div>
                        <div className="text-sm text-warmwhite">{item.product.title}</div>
                        <div className="text-[12px] text-text-secondary">
                          {[item.variant.size, item.variant.color].filter(Boolean).join(" · ") || "—"}
                        </div>
                        <div className="text-xs text-champagne mt-1">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm text-warmwhite">
                        ₹{(unitPrice * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })
              : cart.map((item) => (
                  <div key={item.id} className="bg-emerald-deep px-6 py-5 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-16 object-cover border border-line" />
                      )}
                      <div>
                        <Link href={`/product/${item.slug}`} className="text-sm text-warmwhite hover:text-champagne font-medium">
                          {item.name}
                        </Link>
                        <div className="text-[12px] text-text-secondary mt-0.5">
                          Size: {item.size} · Color: {item.colorName}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div
                            role="group"
                            aria-label={`Quantity adjustment for ${item.name}`}
                            className="flex items-center border border-line"
                          >
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="px-2.5 py-1 text-xs text-warmwhite hover:bg-line focus-visible:ring-1 focus-visible:ring-champagne"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 text-xs text-warmwhite min-w-[24px] text-center" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              aria-label={`Increase quantity of ${item.name}`}
                              className="px-2.5 py-1 text-xs text-warmwhite hover:bg-line focus-visible:ring-1 focus-visible:ring-champagne"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from bag`}
                            className="text-[11px] text-red-400 hover:underline focus-visible:ring-1 focus-visible:ring-champagne p-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-warmwhite font-medium text-right">
                      ₹{(item.numericPrice * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-[280px]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-warmwhite">
                  ₹{(hasDbItems ? dbCart.subtotal : cartSubtotal).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mb-5">
                You&apos;ll confirm shipping and payment with us directly over WhatsApp.
              </p>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-[12px] uppercase tracking-[0.14em] py-4 bg-champagne text-matte-black hover:bg-maroon hover:text-warmwhite transition-colors"
              >
                Order via WhatsApp
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
