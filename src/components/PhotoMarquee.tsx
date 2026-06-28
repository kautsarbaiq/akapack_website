import Image from "next/image";
import Link from "next/link";

export interface MarqueePic {
  src: string;
  label: string;
  href: string;
}

/** Pita foto produk berjalan terus (auto-scroll CSS). Server component — tanpa JS. */
export function PhotoMarquee({ pics }: { pics: MarqueePic[] }) {
  if (pics.length < 6) return null;
  const row = [...pics, ...pics]; // gandakan untuk loop mulus
  return (
    <section className="overflow-hidden border-y border-line bg-ink py-5">
      <div className="flex w-max gap-3 animate-marquee">
        {row.map((p, i) => (
          <Link
            key={i}
            href={p.href}
            aria-hidden={i >= pics.length}
            tabIndex={i >= pics.length ? -1 : 0}
            className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-md sm:h-36 sm:w-36"
          >
            <Image
              src={p.src}
              alt={p.label}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
