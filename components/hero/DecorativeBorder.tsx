import Image from "next/image";

interface DecorativeBorderProps {
  className?: string;
}

/**
 * The royal procession strip (elephants, horses, attendants, lotus
 * blooms) along the base of the Hero.
 *
 * The supplied royal procession artwork sits along the base of the Hero.
 */
export default function DecorativeBorder({ className = "" }: DecorativeBorderProps) {
  return (
    <div
      className={`relative h-36 w-full overflow-hidden border-t border-[#e9dcc0]/10 sm:h-44 ${className}`}
      aria-hidden="true"
    >
      <Image
        src="/hero/hero-border.png.jpeg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[center_58%]"
      />
    </div>
  );
}
