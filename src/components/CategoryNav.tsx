import Link from "next/link";
import type { CategoryGroup } from "@/lib/category-groups";
import { titleCase } from "@/lib/format";
import { catalogHref } from "@/lib/catalog-url";

interface Props {
  groups: CategoryGroup[];
  activeGroup: string | null;
  activeCategoryId: string | null;
  q: string | null;
  sort: string | null;
}

const CHIP = "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors";
const ON = " border-indigo bg-indigo text-white";
const OFF = " border-line bg-card text-ink-soft hover:border-indigo/40 hover:text-indigo-ink";

export function CategoryNav({ groups, activeGroup, activeCategoryId, q, sort }: Props) {
  const current = groups.find((g) => g.slug === activeGroup);

  return (
    <div className="space-y-2">
      {/* Grup induk */}
      <div className="thin-scroll -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Link href={catalogHref({ q, sort })} className={CHIP + (activeGroup === null ? ON : OFF)}>
          Semua
        </Link>
        {groups.map((g) => (
          <Link
            key={g.slug}
            href={catalogHref({ grup: g.slug, q, sort })}
            className={CHIP + (activeGroup === g.slug ? ON : OFF)}
          >
            {g.label}
          </Link>
        ))}
      </div>

      {/* Kategori di dalam grup aktif */}
      {current && (
        <div className="thin-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <Link
            href={catalogHref({ grup: current.slug, q, sort })}
            className={CHIP + (activeCategoryId === null ? ON : OFF)}
          >
            Semua {current.label}
          </Link>
          {current.categories.map((c) => (
            <Link
              key={c.id}
              href={catalogHref({ kategori: c.id, q, sort })}
              className={CHIP + (activeCategoryId === c.id ? ON : OFF)}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                style={{ backgroundColor: c.color || "#ea580c" }}
              />
              {titleCase(c.name)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
