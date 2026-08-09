import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp-cart";
import CartItemControls from "@/components/account/CartItemControls";

export const metadata = { title: "Cart — SANAÉRA" };

export default async function CartPage() {
  const session = await auth();
  const cart = await getOrCreateCart({ userId: session!.user.id });
  const { subtotal, itemCount } = cartTotals(cart);
  const whatsAppUrl =
    cart.items.length > 0
      ? getWhatsAppOrderUrl(cart, { totalItems: itemCount, totalAmount: subtotal })
      : null;

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">
        Cart {itemCount > 0 && <span className="text-text-secondary text-lg">({itemCount})</span>}
      </h1>

      {cart.items.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Your cart is empty.{" "}
          <Link href="/new-arrivals" className="text-champagne hover:underline">
            Continue shopping →
          </Link>
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-px bg-line mb-8">
            {cart.items.map((item) => {
              const unitPrice = Number(item.variant.price ?? item.product.discountPrice ?? item.product.price);
              return (
                <div key={item.id} className="bg-emerald-deep px-6 py-5 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-warmwhite">{item.product.title}</div>
                    <div className="text-[12px] text-text-secondary">
                      {[item.variant.size, item.variant.color].filter(Boolean).join(" · ") || "—"}
                    </div>
                    <div className="mt-2.5">
                      <CartItemControls itemId={item.id} quantity={item.quantity} />
                    </div>
                  </div>
                  <div className="text-sm text-warmwhite">
                    ₹{(unitPrice * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-[280px]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-warmwhite">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-text-secondary mb-5">
                You&apos;ll confirm shipping and payment with us directly over WhatsApp.
              </p>
              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-[12px] uppercase tracking-[0.14em] py-4 bg-champagne text-matte-black hover:bg-champagne/90 transition-colors"
                >
                  Order via WhatsApp
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
