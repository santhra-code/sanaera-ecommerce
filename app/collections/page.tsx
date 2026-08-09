import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import StateScroller from "@/components/StateScroller";
import { products } from "@/lib/products";

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <div className="pt-[140px] px-12 max-md:px-6 max-md:pt-[110px]">
        <span className="font-label text-[11px] tracking-[0.28em] uppercase text-champagne block mb-4">
          The Full Catalog
        </span>
        <h1 className="font-display font-normal text-[clamp(38px,5.5vw,64px)] max-w-[16ch]">
          Collections
        </h1>
      </div>
      <StateScroller />
      <ProductGrid
        title="All Collections"
        description="Bridal, festive, and everyday luxury — every piece currently in the house."
        items={products}
        columns={4}
      />
      <Footer />
    </>
  );
}
