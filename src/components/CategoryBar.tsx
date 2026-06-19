import Link from "next/link";
import type { Category } from "@/lib/types";
import { titleCase } from "@/lib/format";
import { catalogHref } from "@/lib/catalog-url";

interface Props {
  categories: Category[];
  activeId: string | null;
  q: string | null;
  sort: string | null;
}

export function CategoryBar({ categories, activeId, q, sort }: Props) {
  const base = "shrink-0 whitespace-nowrap border px-3 py-1.5 font-mono text-xs transition-colors";
  return (
    <div className="thin-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <Link
        href={catalogHref({ q, sort })}
        className={
          base +
          (activeId === null
            ? " border-ink bg-ink text-paper"
            : " border-line bg-card text-ink-soft hover:border-ink/30 hover:text-ink")
        }
      >
        Semua
      </Link>
      {categories.map((c) => {
        const active = c.id === activeId;
        return (
          <Link
            key={c.id}
            href={catalogHref({ kategori: c.id, q, sort })}
            className={
              base +
              (active
                ? " border-ink bg-ink text-paper"
                : " border-line bg-card text-ink-soft hover:border-ink/30 hover:text-ink")
            }
          >
            <span className="mr-1.5 inline-block h-2 w-2 align-middle" style={{ backgroundColor: c.color || "#4f46e5" }} />
            {titleCase(c.name)}
          </Link>
        );
      })}
    </div>
  );
}
