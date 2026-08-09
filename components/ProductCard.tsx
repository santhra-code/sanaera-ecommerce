import Link from "next/link";
import { Product } from "@/lib/products";

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

  return (
    <Link href={`/product/${product.slug}`} className="group block bg-emerald-deep">
      <div
        className="relative aspect-[3/4] overflow-hidden fabric-texture"
        style={{ background }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          className="absolute w-[60%] opacity-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
        >
          <path
            d="M100 20 C140 30 160 70 145 100 C170 105 180 140 160 160 C140 180 100 175 100 150 C100 175 60 180 40 160 C20 140 30 105 55 100 C40 70 60 30 100 20Z"
            stroke="#FDF8F6"
            strokeWidth="0.8"
            opacity="0.7"
          />
        </svg>
        <span className="absolute top-4 left-4 font-label text-[10px] tracking-[0.14em] uppercase text-warmwhite bg-black/30 px-2.5 py-1.5">
          {product.tag}
        </span>
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] bg-[rgba(45,12,28,0.72)] text-warmwhite text-center text-[11px] uppercase tracking-[0.16em] py-3.5">
          Quick View
        </div>
      </div>
      <div className="px-1 pt-5 pb-2">
        <div className="text-[11px] uppercase tracking-[0.12em] text-antique-gold mb-1.5">
          {product.category}
        </div>
        <h3 className="font-display text-xl">{product.name}</h3>
        <div className="mt-2 text-[13px] text-charcoal/60 flex items-center gap-2">
          {product.price}
          {product.oldPrice && (
            <span className="line-through text-charcoal/35">{product.oldPrice}</span>
          )}
        </div>
        <div className="flex gap-1.5 mt-3">
          <span className="w-[13px] h-[13px] rounded-full border border-black/15" style={{ background: "#6B1B2E" }} />
          <span className="w-[13px] h-[13px] rounded-full border border-black/15" style={{ background: "#1B4332" }} />
          <span className="w-[13px] h-[13px] rounded-full border border-black/15 bg-champagne" />
        </div>
      </div>
    </Link>
  );
}

