import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RemoveWishlistItemButton from "@/components/account/RemoveWishlistItemButton";

export const metadata = { title: "Wishlist — SANAÉRA" };

export default async function WishlistPage() {
  const session = await auth();

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session!.user.id },
    update: {},
    create: { userId: session!.user.id },
    include: {
      items: {
        include: { product: { select: { title: true, slug: true, price: true, discountPrice: true } } },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Wishlist</h1>

      {wishlist.items.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Nothing saved yet.{" "}
          <Link href="/new-arrivals" className="text-champagne hover:underline">
            Browse new arrivals →
          </Link>
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
          {wishlist.items.map((item) => (
            <div key={item.id} className="bg-emerald-deep p-5">
              <Link href={`/product/${item.product.slug}`} className="block mb-3">
                <div className="text-sm text-warmwhite">{item.product.title}</div>
                <div className="text-[13px] text-champagne mt-1">
                  ₹{Number(item.product.discountPrice ?? item.product.price).toLocaleString("en-IN")}
                </div>
              </Link>
              <RemoveWishlistItemButton itemId={item.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
