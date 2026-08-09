import Reveal from "./Reveal";

// Mirrors .gallery .g:nth-child(6n+1..6) in the HTML exactly.
const CELL_GRADIENTS = [
  "linear-gradient(160deg,#441629,#381222)", // emerald -> emerald-deep
  "linear-gradient(160deg,#C88F73,#381222)", // maroon -> emerald-deep
  "linear-gradient(160deg,#DEB092,#E8D8CF)", // champagne -> sand
  "linear-gradient(160deg,#1a0610,#2D0C1C)", // wine-deep -> matte-black
  "linear-gradient(160deg,#5c1f35,#2D0C1C)", // wine-mid -> matte-black
  "linear-gradient(160deg,#6b3a42,#2D0C1C)", // rose-dust -> matte-black
];

export default function Gallery() {
  const cells = Array.from({ length: 12 });

  return (
    <section className="px-12 pt-32 pb-[90px] max-md:px-6 max-md:pt-20 max-md:pb-[70px]">
      <Reveal className="flex justify-between items-end gap-10 flex-wrap mb-16">
        <h2 className="font-display font-normal text-[clamp(32px,4vw,56px)] leading-tight">
          Worn by You
        </h2>
        <p className="max-w-[340px] text-sm leading-relaxed text-charcoal/60">
          Tag @sanaera.house to be featured in our customer gallery.
        </p>
      </Reveal>
      <Reveal>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-0.5 bg-line">
          {cells.map((_, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden"
              style={{ background: CELL_GRADIENTS[i % 6] }}
            >
              <span className="absolute bottom-3 left-3 text-warmwhite text-[11px] tracking-[0.1em] opacity-0 group-hover:opacity-100 transition-opacity duration-[350ms]">
                ♡ 248
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
