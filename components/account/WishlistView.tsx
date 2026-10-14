"use client";

import Link from "next/link";
import { useShop } from "@/components/ShopContext";

export default function WishlistView({ dbWishlist }: { dbWishlist?: any }) {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  const hasDbItems = dbWishlist && dbWishlist.items && dbWishlist.items.length > 0;
  const isWishlistEmpty = !hasDbItems && wishlist.length === 0;

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Wishlist</h1>

      {isWishlistEmpty ? (
        <p className="text-sm text-text-secondary">
          Nothing saved yet.{" "}
          <Link href="/new-arrivals" className="text-champagne hover:underline">
            Browse new arrivals →
          </Link>
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hasDbItems
            ? dbWishlist.items.map((item: any) => (
                <div key={item.id} className="bg-emerald-deep p-5 border border-line flex flex-col justify-between">
                  <Link href={`/product/${item.product.slug}`} className="block mb-3">
                    <div className="text-sm font-medium text-warmwhite hover:text-champagne">{item.product.title}</div>
                    <div className="text-[13px] text-champagne mt-1">
                      ₹{Number(item.product.discountPrice ?? item.product.price).toLocaleString("en-IN")}
                    </div>
                  </Link>
                </div>
              ))
            : wishlist.map((item) => (
                <div key={item.slug} className="bg-emerald-deep p-4 border border-line flex flex-col justify-between group">
                  <div>
                    {item.image && (
                      <div className="aspect-[3/4] overflow-hidden mb-3 relative bg-[#1a0610]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="text-xs text-antique-gold uppercase tracking-wider mb-1">{item.category}</div>
                    <Link href={`/product/${item.slug}`} className="text-sm font-medium text-warmwhite hover:text-champagne block">
                      {item.name}
                    </Link>
                    <div className="text-xs text-champagne mt-1 font-semibold">{item.price}</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        addToCart({
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          numericPrice: item.numericPrice,
                          size: "S",
                          color: "#6B1B2E",
                          colorName: "Maroon",
                          image: item.image,
                        })
                      }
                      className="text-[11px] uppercase tracking-wider py-2 px-3 bg-champagne text-matte-black hover:bg-maroon hover:text-warmwhite transition-colors"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="text-xs text-red-400 hover:underline p-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
