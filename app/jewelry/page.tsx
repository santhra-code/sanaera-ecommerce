import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export default async function JewelryPage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <div className="pt-[140px] px-12 max-md:px-6 max-md:pt-[110px]">
        <span className="font-label text-[11px] tracking-[0.28em] uppercase text-champagne block mb-4">
          Complete the Look
        </span>
        <h1 className="font-display font-normal text-[clamp(38px,5.5vw,64px)] max-w-[16ch]">
          Jewelry
        </h1>
      </div>
      <ProductGrid
        title="The Jewelry Edit"
        description="Pieces designed alongside our textiles, so every layer belongs together."
        items={products}
        columns={4}
      />
      <Footer />
    </>
  );
}
