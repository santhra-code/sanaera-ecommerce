const TERMS = [
  "Kanjivaram Silk",
  "Zardozi",
  "Bandhani",
  "Chikankari",
  "Ikat",
  "Banarasi Brocade",
];

export default function Marquee() {
  const row = [...TERMS, ...TERMS];
  return (
    <div className="bg-matte-black text-sand py-5 overflow-hidden border-y border-line">
      <div className="flex whitespace-nowrap animate-[marquee_34s_linear_infinite]">
        {row.map((t, i) => (
          <span
            key={i}
            className="font-display italic text-xl px-8 opacity-85 after:content-['—'] after:pl-8 after:text-antique-gold after:not-italic"
          >
            {t}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
