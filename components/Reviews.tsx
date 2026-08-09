import Reveal from "./Reveal";

const REVIEWS = [
  {
    name: "Ananya R.",
    text: "The embroidery is beyond anything I tried on for my wedding shopping — it photographed like a painting.",
  },
  {
    name: "Priya M.",
    text: "Fit was tailored perfectly after the video consultation. Worth every rupee for a piece this considered.",
  },
  {
    name: "Meera K.",
    text: "You can feel the hours in it. My mother said it reminded her of pieces from her own wedding trousseau.",
  },
];

export default function Reviews() {
  return (
    <section className="bg-matte-black text-sand px-12 py-28 max-md:px-6 max-md:py-16">
      <Reveal className="flex justify-between items-end flex-wrap gap-6 mb-14">
        <h2 className="font-display font-normal italic text-[clamp(28px,3.4vw,42px)] text-warmwhite">
          What she wore it to say
        </h2>
        <div className="text-right">
          <span className="font-display text-5xl text-champagne block">4.9</span>
          <span className="text-xs uppercase tracking-[0.08em]">128 verified reviews</span>
        </div>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-10">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.1}>
            <div className="border-t border-[rgba(232,216,207,0.15)] pt-6">
              <span className="text-champagne tracking-[2px] block mb-3.5">★★★★★</span>
              <p className="text-sm leading-[1.85] text-[rgba(232,216,207,0.85)] mb-4">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="text-[11.5px] uppercase tracking-[0.08em] text-sand/70">
                {r.name} — Verified Buyer
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
