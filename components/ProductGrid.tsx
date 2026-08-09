import { Product } from "@/lib/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

export default function ProductGrid({
  title,
  description,
  items,
  columns = 4,
}: {
  title: React.ReactNode;
  description: string;
  items: Product[];
  columns?: 3 | 4;
}) {
  return (
    <section className="px-12 py-32 max-md:px-6 max-md:py-20">
      <Reveal className="flex justify-between items-end gap-10 flex-wrap mb-16">
        <h2 className="font-display font-normal text-[clamp(32px,4vw,56px)] leading-tight">
          {title}
        </h2>
        <p className="max-w-[340px] text-sm leading-relaxed text-charcoal/60">{description}</p>
      </Reveal>
      <Reveal>
        <div
          className={`grid gap-px bg-line ${
            columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
