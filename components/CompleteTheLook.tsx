import Reveal from "./Reveal";

const LOOKS = [
  { cat: "Jewelry · Necklace", name: "Kundan Choker Set", price: "₹38,000", theme: "linear-gradient(160deg,#441629,#2D0C1C)" },
  { cat: "Jewelry · Earrings", name: "Polki Jhumka", price: "₹22,500", theme: "linear-gradient(160deg,#381222,#1a0610)" },
  { cat: "Accessory · Footwear", name: "Zari Mojari Heels", price: "₹14,200", theme: "linear-gradient(160deg,#2D0C1C,#1a0610)" },
  { cat: "Accessory · Clutch", name: "Zardozi Potli Bag", price: "₹9,800", theme: "linear-gradient(160deg,#DEB092,#E8D8CF)" },
];

export default function CompleteTheLook() {
  return (
    <section className="px-12 py-28 max-md:px-6 max-md:py-16">
      <Reveal className="flex justify-between items-end gap-8 flex-wrap mb-12">
        <h2 className="font-display font-normal text-[clamp(28px,3.4vw,44px)]">
          Complete the Look
        </h2>
        <p className="max-w-[320px] text-[13.5px] text-charcoal/60 leading-relaxed">
          Curated jewelry and accessories to pair with this piece.
        </p>
      </Reveal>
      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
          {LOOKS.map((l) => (
            <div key={l.name} className="bg-warmwhite">
              <div className="aspect-[3/4]" style={{ background: l.theme }} />
              <div className="px-4.5 pt-4 pb-5">
                <div className="text-[10.5px] uppercase tracking-[0.1em] text-antique-gold mb-1">
                  {l.cat}
                </div>
                <h3 className="font-display text-lg">{l.name}</h3>
                <div className="mt-1.5 text-[12.5px] text-charcoal/60">{l.price}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
