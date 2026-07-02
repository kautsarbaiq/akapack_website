import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCategories, fetchProductsPage, fetchStockFor } from "@/lib/catalog";
import {
  buildCategoryGroups,
  categoryIdsForGroup,
  allGroupSlugs,
  groupSeo,
} from "@/lib/category-groups";
import { titleCase } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 3600;

export function generateStaticParams() {
  return allGroupSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!allGroupSlugs().includes(slug)) return { title: "Grup tidak ditemukan", robots: { index: false } };
  const seo = groupSeo(slug);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/produk/grup/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Akapack",
      locale: "id_ID",
      title: seo.title,
      description: seo.description,
      url: `/produk/grup/${slug}`,
    },
  };
}

export default async function GrupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!allGroupSlugs().includes(slug)) notFound();

  const seo = groupSeo(slug);
  const categories = await fetchCategories();
  const groups = buildCategoryGroups(categories);
  const group = groups.find((g) => g.slug === slug);
  const categoryIds = categoryIdsForGroup(categories, slug);

  const result = await fetchProductsPage({ categoryIds, pageSize: 24, sort: "name", photoFirst: true });
  const stock = await fetchStockFor(result.products.map((p) => p.id));
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const fmt = new Intl.NumberFormat("id-ID");

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.h1,
    description: seo.description,
    url: `${SITE_URL}/produk/grup/${slug}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(result.products.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: result.total,
            itemListElement: result.products.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/produk/${p.id}`,
              name: p.name,
            })),
          },
        }
      : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Katalog", item: `${SITE_URL}/produk` },
      { "@type": "ListItem", position: 3, name: seo.h1, item: `${SITE_URL}/produk/grup/${slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-indigo-ink">Beranda</Link>
        <span className="px-1.5">/</span>
        <Link href="/produk" className="hover:text-indigo-ink">Katalog</Link>
        <span className="px-1.5">/</span>
        <span className="font-medium text-ink">{seo.h1}</span>
      </nav>

      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{seo.h1}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-ink-soft">{seo.intro}</p>
      <p className="mt-3 text-sm text-ink-soft">{fmt.format(result.total)} produk</p>

      {/* Sub-kategori dalam grup */}
      {group && group.categories.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {group.categories.map((c) => (
            <Link
              key={c.id}
              href={`/produk?kategori=${c.id}`}
              className="rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-indigo/40 hover:text-indigo-ink"
            >
              {titleCase(c.name)}
            </Link>
          ))}
        </div>
      )}

      {/* Grid produk */}
      {result.products.length === 0 ? (
        <div className="mt-8 border border-dashed border-line py-20 text-center text-ink-soft">
          Produk untuk grup ini belum tersedia.
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {result.products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={p.category_id ? catMap.get(p.category_id) : null}
                stock={stock[p.id]}
              />
            ))}
          </div>
          {result.total > result.products.length && (
            <div className="mt-8 text-center">
              <Link
                href={`/produk?grup=${slug}`}
                className="inline-block rounded-full bg-indigo px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Lihat semua {fmt.format(result.total)} produk →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
