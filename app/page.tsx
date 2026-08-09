import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";
import Marquee from "@/components/Marquee";
import ProductGrid from "@/components/ProductGrid";
import StateScroller from "@/components/StateScroller";
import ArtisanStory from "@/components/ArtisanStory";
import SustainabilityBand from "@/components/SustainabilityBand";
import Gallery from "@/components/Gallery";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ScrollIndicator from "@/components/ScrollIndicator";
import { products } from "@/lib/products";

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollIndicator />
      <Header />
      <Hero />
      <Marquee />
      <ProductGrid
        title={
          <>
            The Featured
            <br />
            Collection
          </>
        }
        description="Six silhouettes drawn from six regions — each piece carries the hand of the artisan who made it, and the story of the loom it came from."
        items={products}
        columns={4}
      />
      <StateScroller />
      <ArtisanStory />
      <ProductGrid
        title="Best Sellers"
        description="The pieces our house is known for — worn on runways, red carpets, and wedding mandaps alike."
        items={products.slice(0, 6)}
        columns={3}
      />
      <SustainabilityBand />
      <Gallery />
      <Newsletter />
      <Footer />
    </>
  );
}
