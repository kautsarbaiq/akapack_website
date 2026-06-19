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
    "border border-line bg-card px-4 py-2 font-mono text-xs transition-colors";
  const disabled = "cursor-not-allowed border-line/60 text-ink-soft/50";
  const enabled = "text-ink hover:border-ink/30";

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Navigasi halaman">
      {prev ? (
        <Link href={catalogHref({ ...base, hal: page - 1 })} className={`${btn} ${enabled}`}>
          ← Sebelumnya
        </Link>
      ) : (
        <span className={`${btn} ${disabled}`}>← Sebelumnya</span>
      )}

      <span className="font-mono text-xs text-ink-soft">
        Hal <b className="font-medium text-ink">{page}</b> / {pageCount}
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
