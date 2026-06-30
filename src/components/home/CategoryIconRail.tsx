import Link from "next/link";
import Image from "next/image";
import { monogram } from "@/lib/format";

export interface IconItem {
  slug: string;
  label: string;
  image: string | null;
  color: string;
  count: number;
}

/** Baris ikon kategori (gaya marketplace) — grid foto bulat + label. */
export function CategoryIconRail({ items }: { items: IconItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-6 lg:grid-cols-10">
      {items.map((g) => (
        <Link
          key={g.slug}
          href={`/produk/grup/${g.slug}`}
          className="group flex flex-col items-center gap-2 text-center"
        >
          <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-2 shadow-card transition-transform group-hover:-translate-y-0.5 group-hover:shadow-card-hover sm:h-[72px] sm:w-[72px]">
            {g.image ? (
              <Image
                src={g.image}
                alt={g.label}
                fill
                sizes="72px"
                className="object-cover"
              />
            ) : (
              <span
                className="font-display text-2xl font-bold"
                style={{ color: g.color }}
                aria-hidden="true"
              >
                {monogram(g.label)}
              </span>
            )}
          </span>
          <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink transition-colors group-hover:text-indigo-ink sm:text-xs">
            {g.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
