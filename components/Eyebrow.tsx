export default function Eyebrow({
  children,
  className = "",
  as: Tag = "span",
  color = "text-antique-gold",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "div";
  color?: string;
}) {
  return (
    <Tag className={`font-label tracking-[0.28em] uppercase text-[11px] ${color} ${className}`}>
      {children}
    </Tag>
  );
}
