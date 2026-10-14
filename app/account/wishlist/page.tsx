import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WishlistView from "@/components/account/WishlistView";

export const metadata = { title: "Wishlist — SANAÉRA" };

export default async function WishlistPage() {
  const session = await auth();
  let dbWishlist = null;

  if (session?.user?.id) {
    try {
      dbWishlist = await prisma.wishlist.findUnique({
        where: { userId: session.user.id },
        include: {
          items: {
            include: { product: { select: { title: true, slug: true, price: true, discountPrice: true } } },
            orderBy: { addedAt: "desc" },
          },
        },
      });
    } catch (e) {
      console.error("Failed to load db wishlist:", e);
    }
  }

  return <WishlistView dbWishlist={dbWishlist} />;
}

