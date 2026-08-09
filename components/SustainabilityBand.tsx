import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";
import Button from "./Button";

const STATS = [
  { value: "100%", label: "Traceable Origin" },
  { value: "Zero", label: "Plastic Packaging" },
  { value: "Fair", label: "Artisan Wages" },
];

export default function SustainabilityBand() {
  return (
    <section className="relative overflow-hidden bg-emerald-deep text-warmwhite text-center px-12 py-28 max-md:px-6 max-md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(222,176,146,0.16),transparent_60%)]" />
      <div className="relative">
        <Reveal>
          <Eyebrow color="text-champagne" className="block mb-6">Our Commitment</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display font-normal text-[clamp(30px,4.4vw,58px)] leading-tight max-w-[18ch] mx-auto mb-7">
            Luxury that gives back to the hands that made it.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-[60ch] mx-auto text-[15px] leading-[1.9] text-sand mb-10">
            Every SANAÉRA garment is traced to its loom of origin. We pay artisans fair-trade
            wages, use GOTS-certified natural dyes, and package every order in biodegradable,
            reusable silk boxes.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Button variant="solid">Read Our Sustainability Report</Button>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="flex justify-center gap-16 flex-wrap mt-14">
            {STATS.map((s) => (
              <div key={s.label}>
                <span className="font-display text-[44px] text-champagne block">{s.value}</span>
                <small className="text-[11px] uppercase tracking-[0.14em] text-sand">
                  {s.label}
                </small>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
