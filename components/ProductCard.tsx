"use client";

import Link from "next/link";
import { Product } from "@/lib/products";
import { useShop } from "./ShopContext";

// Mirrors the HTML's position-based cycling exactly:
// .card:nth-child(4n+1..4n+4) .card-media{...}
const POSITION_GRADIENTS = [
  "linear-gradient(160deg,#441629,#381222)", // 4n+1: emerald -> emerald-deep
  "linear-gradient(160deg,#C88F73,#381222)", // 4n+2: maroon -> emerald-deep
  "linear-gradient(160deg,#1a0610,#2D0C1C)", // 4n+3: wine-deep -> matte-black
  "linear-gradient(160deg,#DEB092,#E8D8CF)", // 4n+4: champagne -> sand
];

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const background = POSITION_GRADIENTS[index % 4];
  const image = product.images[0];
  const { toggleWishlist, isInWishlist } = useShop();

  const isWishlisted = isInWishlist(product.slug);
  const numericPrice = Number(product.price.replace(/[^0-9.]/g, "")) || 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      slug: product.slug,
      name: product.name,
      price: product.price,
      numericPrice,
      category: product.category,
      image: product.images[0]?.url ?? "",
    });
  };

  return (
    <div className="group block bg-emerald-deep relative">
      {/* Wishlist Button - sibling with z-20 to avoid invalid HTML nesting inside <a> */}
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={isWishlisted}
        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none ${
          isWishlisted
            ? "bg-[#6B1B2E] text-[#DEB092] scale-110 shadow-md"
            : "bg-black/40 text-warmwhite hover:bg-[#6B1B2E] hover:text-[#DEB092]"
        }`}
      >
        <span aria-hidden="true">{isWishlisted ? "♥" : "♡"}</span>
      </button>

      <Link
        href={`/product/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
      >
        <div
          className="relative aspect-[3/4] overflow-hidden fabric-texture"
          style={{ background }}
        >
          {image ? (
            <img
              src={image.url}
              alt={image.alt ?? product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.05]"
            />
          ) : null}
          <div className="absolute inset-0" aria-hidden="true" />
          <svg
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
            className="absolute w-[60%] opacity-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08] pointer-events-none"
          >
            <path
              d="M100 20 C140 30 160 70 145 100 C170 105 180 140 160 160 C140 180 100 175 100 150 C100 175 60 180 40 160 C20 140 30 105 55 100 C40 70 60 30 100 20Z"
              stroke="#FDF8F6"
              strokeWidth="0.8"
              opacity="0.7"
            />
          </svg>
          <span className="absolute top-4 left-4 font-label text-[10px] tracking-[0.14em] uppercase text-warmwhite bg-black/40 px-2.5 py-1.5 backdrop-blur-sm">
            {product.tag}
          </span>
          <div
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] bg-[rgba(45,12,28,0.85)] text-warmwhite text-center text-[11px] uppercase tracking-[0.16em] py-3.5"
          >
            Quick View
          </div>
        </div>
        <div className="px-1 pt-5 pb-2">
          <div className="text-[11px] uppercase tracking-[0.12em] text-antique-gold mb-1.5">
            {product.category}
          </div>
          <h3 className="font-display text-xl text-warmwhite">{product.name}</h3>
          <div className="mt-2 text-[13px] text-charcoal/80 flex items-center gap-2">
            <span>{product.price}</span>
            {product.oldPrice && (
              <span className="line-through text-charcoal/45">{product.oldPrice}</span>
            )}
          </div>
          <div className="flex gap-1.5 mt-3" aria-hidden="true">
            <span className="w-[13px] h-[13px] rounded-full border border-black/15" style={{ background: "#6B1B2E" }} />
            <span className="w-[13px] h-[13px] rounded-full border border-black/15" style={{ background: "#1B4332" }} />
            <span className="w-[13px] h-[13px] rounded-full border border-black/15 bg-champagne" />
          </div>
        </div>
      </Link>
    </div>
  );
}


