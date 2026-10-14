import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import CraftBand from "@/components/CraftBand";
import CompleteTheLook from "@/components/CompleteTheLook";
import { getProductBySlug } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return notFound();

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="pt-[88px] outline-none">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 grid lg:grid-cols-[1fr_440px] gap-8 items-start">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>
        <CraftBand />
        <CompleteTheLook />
      </main>
      <Footer />
    </>
  );
}
