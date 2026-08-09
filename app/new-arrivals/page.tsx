import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/lib/products";

export default function NewArrivalsPage() {
  const newItems = products.filter((p) => p.tag === "New");
  return (
    <>
      <Header />
      <div className="pt-[140px] px-12 max-md:px-6 max-md:pt-[110px]">
        <span className="font-label text-[11px] tracking-[0.28em] uppercase text-champagne block mb-4">
          Just Landed
        </span>
        <h1 className="font-display font-normal text-[clamp(38px,5.5vw,64px)] max-w-[16ch]">
          New Arrivals
        </h1>
      </div>
      <ProductGrid
        title="This Week's Edit"
        description="Updated every Friday. Sign in to be notified the moment a new piece is released."
        items={newItems.length ? newItems : products}
        columns={4}
      />
      <Footer />
    </>
  );
}
