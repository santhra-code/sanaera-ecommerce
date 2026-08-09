import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import CraftBand from "@/components/CraftBand";
import CompleteTheLook from "@/components/CompleteTheLook";
import Reviews from "@/components/Reviews";
import { getProduct, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return notFound();

  return (
    <>
      <Header />
      <main className="pt-[88px]">
        <div className="grid lg:grid-cols-[1fr_460px]">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>
        <CraftBand />
        <CompleteTheLook />
        <Reviews />
      </main>
      <Footer />
    </>
  );
}
