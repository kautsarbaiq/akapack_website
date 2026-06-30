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
import { SITE_URL } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/CategoryNav";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { Pagination } from "@/components/Pagination";

// ISR: cache penuh per-URL (mis. /produk & /produk?kategori=X) selama 1 jam.
export const revalidate = 3600;

const PAGE_SIZE = 24;
const SORTS: ProductSort[] = ["name", "price_asc", "price_desc"];

interface SP {
  q?: string;
  kategori?: string;
  grup?: string;
  sort?: string;
  hal?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim() || null;
  const kategori = sp.kategori || null;
  const grup = sp.grup || null;
  const page = Math.max(1, Number.parseInt(sp.hal ?? "1", 10) || 1);

  let label: string | null = null;
  let canonical = "/produk";
  if (kategori) {
    const categories = await fetchCategories();
    const cat = categories.find((c) => c.id === kategori) ?? null;
    label = cat ? titleCase(cat.name) : null;
    canonical = `/produk?kategori=${kategori}`;
  } else if (grup) {
    label = groupLabel(grup);
    // Konsolidasikan ke landing page grup yang ber-URL bersih (SEO).
    canonical = `/produk/grup/${grup}`;
  }

  const title = q
    ? `Cari “${q}” di katalog`
    : label
      ? `Grosir ${label} — Harga Grosir Bandung & Garut`
      : "Katalog Produk — Grosir Kemasan & Mesin";
  const description = label
    ? `Jual grosir ${label} di Akapack Bandung & Garut. Harga grosir, stok nyata 2 cabang, pesan langsung via WhatsApp.`
    : "Jelajahi 3.900+ produk kemasan plastik, kertas, box & mesin pengemas Akapack. Harga grosir, stok nyata dari cabang Bandung & Garut.";

  // Hasil pencarian (?q) & paginasi (>1) tipis/duplikatif → noindex tapi tetap follow.
  const noindex = Boolean(q) || page > 1;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: "Akapack",
      locale: "id_ID",
      title: `${title} · Akapack`,
      description,
      url: canonical,
    },
  };
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

  const heading = q
    ? `Hasil “${q}”`
    : activeCat
      ? titleCase(activeCat.name)
      : activeGroup
        ? groupLabel(activeGroup)
        : "Semua produk";
  const canonicalPath = kategori
    ? `/produk?kategori=${kategori}`
    : grup
      ? `/produk?grup=${grup}`
      : "/produk";
  const itemListJsonLd =
    result.products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${heading} — Akapack`,
          url: `${SITE_URL}${canonicalPath}`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: result.total,
            itemListElement: result.products.map((p, i) => ({
              "@type": "ListItem",
              position: (result.page - 1) * PAGE_SIZE + i + 1,
              url: `${SITE_URL}/produk/${p.id}`,
              name: p.name,
            })),
          },
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      {/* Heading */}
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-ink">
        Katalog
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {heading}
        </h1>
        <p className="text-sm text-ink-soft">
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
