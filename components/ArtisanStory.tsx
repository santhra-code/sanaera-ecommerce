import Reveal from "./Reveal";
import Eyebrow from "./Eyebrow";

const STATS = [
  { value: "1,240", label: "Artisan Families" },
  { value: "18", label: "Weaving Regions" },
  { value: "96hrs", label: "Avg. Craft Time" },
];

export default function ArtisanStory() {
  return (
    <section className="bg-emerald grid md:grid-cols-2 gap-20 items-center px-12 py-32 max-md:px-6 max-md:py-20 max-md:gap-10">
      <Reveal className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-emerald-deep to-matte-black">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] opacity-55"
        >
          <circle cx="150" cy="150" r="90" stroke="#DEB092" strokeWidth="1" />
          <path
            d="M150 60 L150 240 M60 150 L240 150"
            stroke="#DEB092"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <path
            d="M90 90 Q150 40 210 90 Q260 150 210 210 Q150 260 90 210 Q40 150 90 90 Z"
            stroke="#DEB092"
            strokeWidth="1"
          />
        </svg>
      </Reveal>

      <Reveal delay={0.15}>
        <Eyebrow className="block mb-5">Behind the Loom</Eyebrow>
        <h2 className="font-display font-normal text-[clamp(30px,3.6vw,46px)] leading-[1.15] mb-6">
          The hands that hold three hundred years of memory.
        </h2>
        <p className="text-[15px] leading-[1.9] text-charcoal/70 max-w-[46ch] mb-4">
          In a small workshop outside Varanasi, master weaver Rajendra Prasad ties each silk
          thread by hand — a technique passed down five generations, unchanged since the Mughal
          courts first commissioned his family&apos;s looms.
        </p>
        <div className="font-display italic text-xl text-maroon border-l-2 border-maroon pl-5 my-6">
          &ldquo;A saree is not stitched. It is remembered, thread by thread.&rdquo;
        </div>
        <div className="flex gap-12 mt-9 flex-wrap">
          {STATS.map((s) => (
            <div key={s.label}>
              <span className="font-display text-3xl text-emerald block">{s.value}</span>
              <small className="text-[11px] uppercase tracking-[0.12em] text-charcoal/50">
                {s.label}
              </small>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
