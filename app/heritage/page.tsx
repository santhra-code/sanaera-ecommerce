import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtisanStory from "@/components/ArtisanStory";
import SustainabilityBand from "@/components/SustainabilityBand";

export default function HeritagePage() {
  return (
    <>
      <Header />
      <div className="pt-[140px] pb-20 px-12 max-md:px-6 max-md:pt-[110px]">
        <span className="font-label text-[11px] tracking-[0.28em] uppercase text-champagne block mb-4">
          Est. 1998
        </span>
        <h1 className="font-display font-normal text-[clamp(38px,5.5vw,64px)] max-w-[16ch] mb-5">
          Heritage
        </h1>
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-sand">
          SANAÉRA began as a single loom outside Varanasi and grew into a house spanning
          eighteen weaving regions — without ever losing the hand of the artisan.
        </p>
      </div>
      <ArtisanStory />
      <SustainabilityBand />
      <Footer />
    </>
  );
}
