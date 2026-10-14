import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import CartView from "@/components/account/CartView";

export const metadata = { title: "Cart — SANAÉRA" };

export default async function CartPage() {
  const session = await auth();
  let dbCart = null;

  if (session?.user?.id) {
    try {
      dbCart = await getOrCreateCart({ userId: session.user.id });
    } catch (e) {
      console.error("Failed to load db cart:", e);
    }
  }

  return <CartView dbCart={dbCart} />;
}

