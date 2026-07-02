import Link from "next/link";
import { catalogHref, type CatalogParams } from "@/lib/catalog-url";

interface Props {
  page: number;
  pageCount: number;
  base: Omit<CatalogParams, "hal">;
}

export function Pagination({ page, pageCount, base }: Props) {
  if (pageCount <= 1) return null;
  const prev = page > 1;
  const next = page < pageCount;

  const btn =
    "rounded-full border px-5 py-2.5 text-xs font-semibold transition-colors";
  const disabled = "cursor-not-allowed border-line/60 text-ink-soft/50";
  const enabled = "border-line bg-card text-ink hover:border-indigo/40 hover:text-indigo-ink";

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Navigasi halaman">
      {prev ? (
        <Link href={catalogHref({ ...base, hal: page - 1 })} className={`${btn} ${enabled}`}>
          ← Sebelumnya
        </Link>
      ) : (
        <span className={`${btn} ${disabled}`}>← Sebelumnya</span>
      )}

      <span className="rounded-full bg-paper-2 px-4 py-2 text-xs font-medium text-ink-soft">
        Hal <b className="font-bold text-ink">{page}</b> / {pageCount}
      </span>

      {next ? (
        <Link href={catalogHref({ ...base, hal: page + 1 })} className={`${btn} ${enabled}`}>
          Berikutnya →
        </Link>
      ) : (
        <span className={`${btn} ${disabled}`}>Berikutnya →</span>
      )}
    </nav>
  );
}
