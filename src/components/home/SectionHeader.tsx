import Link from "next/link";

interface Props {
  title: string;
  sub?: string;
  href?: string;
  hrefLabel?: string;
  light?: boolean; // untuk band gelap/berwarna
}

/** Judul seksi konsisten: aksen oranye + pill "lihat semua". */
export function SectionHeader({ title, sub, href, hrefLabel = "Lihat semua", light = false }: Props) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 shrink-0 rounded-full bg-indigo" />
        <div>
          <h2
            className={
              "text-lg font-extrabold tracking-tight sm:text-xl " +
              (light ? "text-white" : "text-ink")
            }
          >
            {title}
          </h2>
          {sub && (
            <p className={"text-xs " + (light ? "text-white/70" : "text-ink-soft")}>{sub}</p>
          )}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className={
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors " +
            (light
              ? "border-white/30 text-white hover:bg-white/10"
              : "border-line text-indigo-ink hover:border-indigo/40 hover:bg-indigo-wash")
          }
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
