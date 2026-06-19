import type { Metadata } from "next";
import {
  fetchCategories,
  fetchProductsPage,
  fetchStockFor,
  type ProductSort,
} from "@/lib/catalog";
import {
  buildCategoryGroups,
  categoryIdsForGroup,
  groupLabel,
  groupSlugFor,
} from "@/lib/category-groups";
import { titleCase } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/CategoryNav";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { Pagination } from "@/components/Pagination";

export const metadata: Metadata = {
  title: "Katalog produk",
  description: "Jelajahi 3.900+ produk kemasan & mesin Akapack dengan harga grosir.",
};

const PAGE_SIZE = 24;
const SORTS: ProductSort[] = ["name", "price_asc", "price_desc"];

interface SP {
  q?: string;
  kategori?: string;
  grup?: string;
  sort?: string;
  hal?: string;
}

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.hal ?? "1", 10) || 1);
  const sort: ProductSort = SORTS.includes(sp.sort as ProductSort)
    ? (sp.sort as ProductSort)
    : "name";
  const kategori = sp.kategori || null;
  const grup = sp.grup || null;
  const q = sp.q || null;

  const categories = await fetchCategories();
  const groups = buildCategoryGroups(categories);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const activeCat = kategori ? (catMap.get(kategori) ?? null) : null;
  const activeGroup = activeCat ? groupSlugFor(activeCat.name) : grup;
  const categoryIds = !kategori && grup ? categoryIdsForGroup(categories, grup) : null;

  const result = await fetchProductsPage({
    page,
    pageSize: PAGE_SIZE,
    categoryId: kategori,
    categoryIds,
    search: q,
    sort,
  });
  const stock = await fetchStockFor(result.products.map((p) => p.id));

  const fmt = new Intl.NumberFormat("id-ID");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Heading */}
      <div className="mb-1 font-mono text-xs uppercase tracking-[0.16em] text-ink-soft">
        Katalog
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {q
            ? `Hasil “${q}”`
            : activeCat
              ? titleCase(activeCat.name)
              : activeGroup
                ? groupLabel(activeGroup)
                : "Semua produk"}
        </h1>
        <p className="font-mono text-xs text-ink-soft">
          {fmt.format(result.total)} produk
        </p>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar initial={q} kategori={kategori} grup={grup} sort={sort} />
        <SortSelect value={sort} q={q} kategori={kategori} grup={grup} />
      </div>

      {/* Filter: grup induk → kategori */}
      <div className="mt-4 border-y border-line py-3">
        <CategoryNav
          groups={groups}
          activeGroup={activeGroup}
          activeCategoryId={kategori}
          q={q}
          sort={sort}
        />
      </div>

      {/* Grid */}
      {result.products.length === 0 ? (
        <div className="border border-dashed border-line py-24 text-center">
          <p className="text-ink-soft">Tidak ada produk yang cocok.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {result.products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              category={p.category_id ? catMap.get(p.category_id) : null}
              stock={stock[p.id]}
            />
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        base={{ q, kategori, grup, sort }}
      />
    </div>
  );
}
