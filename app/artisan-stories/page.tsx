import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtisanStory from "@/components/ArtisanStory";

export default function ArtisanStoriesPage() {
  return (
    <>
      <Header />
      <div className="pt-[140px] pb-20 px-12 max-md:px-6 max-md:pt-[110px]">
        <span className="font-label text-[11px] tracking-[0.28em] uppercase text-champagne block mb-4">
          Behind Every Thread
        </span>
        <h1 className="font-display font-normal text-[clamp(38px,5.5vw,64px)] max-w-[16ch]">
          Artisan Stories
        </h1>
      </div>
      <ArtisanStory />
      <Footer />
    </>
  );
}
