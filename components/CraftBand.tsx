import Reveal from "./Reveal";

const ORIGIN = [
  { value: "Jaipur", label: "Region of Origin" },
  { value: "210 hrs", label: "Hand Embroidery Time" },
  { value: "14", label: "Karigars Involved" },
];

export default function CraftBand() {
  return (
    <section className="bg-emerald grid md:grid-cols-2 gap-16 items-center px-12 py-28 max-md:px-6 max-md:py-16 max-md:gap-8">
      <Reveal className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-emerald-deep to-matte-black">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] opacity-55"
        >
          <circle cx="150" cy="150" r="88" stroke="#DEB092" strokeWidth="1" />
          <path
            d="M90 90 Q150 40 210 90 Q260 150 210 210 Q150 260 90 210 Q40 150 90 90Z"
            stroke="#DEB092"
            strokeWidth="1"
          />
        </svg>
      </Reveal>
      <Reveal delay={0.15}>
        <span className="font-label text-[11px] tracking-[0.26em] uppercase text-antique-gold block mb-4">
          Meet the Artisan
        </span>
        <h2 className="font-display font-normal text-[clamp(28px,3.2vw,42px)] leading-tight mb-5">
          Zardozi by the karigars of Jaipur.
        </h2>
        <p className="text-[14.5px] leading-[1.9] text-charcoal/70 max-w-[48ch] mb-3.5">
          This piece was embroidered by a collective of 14 karigars led by master craftsman Iqbal
          Mirza, whose family has practiced zardozi needlework for four generations in the old
          city of Jaipur.
        </p>
        <p className="text-[14.5px] leading-[1.9] text-charcoal/70 max-w-[48ch] mb-3.5">
          Every motif is drawn by hand before a single thread is laid — no two pieces in this
          edition are stitched in quite the same rhythm.
        </p>
        <div className="flex gap-10 mt-8 flex-wrap">
          {ORIGIN.map((o) => (
            <div key={o.label}>
              <span className="font-display italic text-[19px] text-maroon block">{o.value}</span>
              <small className="text-[10.5px] uppercase tracking-[0.1em] text-charcoal/50">
                {o.label}
              </small>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
