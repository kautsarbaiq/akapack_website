import Link from "next/link";
import {
  fetchBanners,
  fetchCategories,
  fetchCategoryCounts,
  fetchGroupSettings,
  fetchProductsWithImages,
  fetchProductsPage,
  fetchStockFor,
} from "@/lib/catalog";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { CategoryIconRail } from "@/components/home/CategoryIconRail";
import { PromoTiles } from "@/components/home/PromoTiles";
import { ProductRail } from "@/components/home/ProductRail";
import { SectionHeader } from "@/components/home/SectionHeader";
import {
  buildCategoryGroups,
  countByGroup,
  groupDefaultOrder,
  groupSlugFor,
} from "@/lib/category-groups";
import { SITE, WA_PRIMARY, waLink } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";
import { HowToBuy } from "@/components/HowToBuy";
import { CtaBand } from "@/components/CtaBand";
import { BranchCard } from "@/components/BranchCard";

// ISR: halaman tetap statis tapi menyegarkan jumlah produk & stok tiap jam.
export const revalidate = 3600;

export default async function Home() {
  const [categories, { byCategory, total }, featured, groupSettings, withImages, banners] =
    await Promise.all([
      fetchCategories(),
      fetchCategoryCounts(),
      fetchProductsPage({ page: 1, pageSize: 24, sort: "name", imageOnly: true }),
      fetchGroupSettings(),
      fetchProductsWithImages(1500),
      fetchBanners(),
    ]);
  const groups = buildCategoryGroups(categories);
  const groupCounts = countByGroup(categories, byCategory);

  // Bucket produk berfoto per grup → foto kartu kategori + etalase per kategori.
  const catNameById = new Map(categories.map((c) => [c.id, c.name]));
  const groupImg = new Map<string, string>();
  const byGroup = new Map<string, typeof withImages>();
  for (const p of withImages) {
    if (!p.category_id || !p.image_url) continue;
    const slug = groupSlugFor(catNameById.get(p.category_id) ?? "");
    if (!groupImg.has(slug)) groupImg.set(slug, p.image_url);
    const arr = byGroup.get(slug) ?? [];
    if (arr.length < 12) arr.push(p);
    byGroup.set(slug, arr);
  }

  // Gabung grup dengan pengaturan (foto, urutan, label) dari dashboard.
  const displayGroups = groups
    .map((g) => {
      const s = groupSettings.get(g.slug);
      return {
        slug: g.slug,
        label: s?.label || g.label,
        color: g.categories[0]?.color || "#ea580c",
        image: s?.image_url || groupImg.get(g.slug) || null,
        count: groupCounts.get(g.slug) ?? 0,
        order: s?.sort_order ?? groupDefaultOrder(g.slug),
        active: s?.is_active ?? true,
      };
    })
    .filter((g) => g.active)
    .sort((a, b) => a.order - b.order);

  // Etalase produk per kategori (rail) — grup dgn cukup foto.
  const featuredGroups = displayGroups
    .filter((g) => (byGroup.get(g.slug)?.length ?? 0) >= 4)
    .slice(0, 6);
  const showcaseStock = await fetchStockFor(
    featuredGroups.flatMap((g) => (byGroup.get(g.slug) ?? []).map((p) => p.id)),
  );

  // Pita foto produk (marquee).
  const marqueePics = displayGroups
    .map((g) => {
      const src = groupImg.get(g.slug);
      return src ? { src, label: g.label, href: `/produk/grup/${g.slug}` } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 18);

  // Rekomendasi: utamakan produk berfoto.
  const pool = featured.products;
  const showcase = [
    ...pool.filter((p) => p.image_url),
    ...pool.filter((p) => !p.image_url),
  ].slice(0, 12);
  const stock = await fetchStockFor(showcase.map((p) => p.id));
  const catMap = new Map(categories.map((c) => [c.id, c]));
  // Produk terbaru berfoto (urut updated_at) untuk band gelap.
  const latest = withImages.slice(0, 10);
  const latestStock = await fetchStockFor(latest.map((p) => p.id));
  const fmt = new Intl.NumberFormat("id-ID");

  return (
    <div className="pb-4">
      {/* Banner hero (full-width, geser + auto-scroll). Diisi via Dashboard → Banner. */}
      {banners.length > 0 ? (
        <HeroCarousel slides={banners} />
      ) : (
        <section className="bg-ink text-white">
          <div className="mx-auto flex min-h-[260px] max-w-6xl flex-col items-start justify-center gap-4 px-4 py-12 sm:min-h-[360px] sm:px-6">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
              Grosir kemasan &amp; mesin · Bandung — Garut
            </div>
            <h2 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
              Grosir kemasan plastik &amp; mesin pengemas.
            </h2>
            <p className="max-w-xl text-white/70">
              Poster produk akan tampil di sini — tambahkan lewat Dashboard → Banner.
            </p>
            <Link
              href="/produk"
              className="mt-1 rounded-full bg-indigo px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Lihat katalog
            </Link>
          </div>
        </section>
      )}

      {/* Strip layanan */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <ServiceStrip />
      </section>

      {/* H1 + intro (ringkas, untuk SEO) */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          Grosir Kemasan Plastik, Kertas, Box &amp; Mesin Pengemas — Bandung &amp; Garut
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Lebih dari {fmt.format(total)} produk harga grosir, stok nyata dari dua cabang.
          Pesan langsung via WhatsApp.
        </p>
      </section>

      {/* Belanja per kategori */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <SectionHeader title="Belanja per Kategori" href="/produk" hrefLabel="Semua kategori" />
        <CategoryIconRail items={displayGroups} />
      </section>

      {/* Promo tiles */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <PromoTiles />
      </section>

      {/* Rekomendasi */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <SectionHeader title="Rekomendasi untukmu" href="/produk" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {showcase.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              category={p.category_id ? catMap.get(p.category_id) : null}
              stock={stock[p.id]}
            />
          ))}
        </div>
      </section>

      {/* Band gelap: produk terbaru */}
      {latest.length >= 4 && (
        <section className="mt-12 bg-ink py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ProductRail
              title="Produk Terbaru"
              href="/produk"
              products={latest}
              stock={latestStock}
              catMap={catMap}
              light
            />
          </div>
        </section>
      )}

      {/* Rail produk per kategori */}
      <div className="mx-auto mt-12 max-w-6xl space-y-10 px-4 sm:px-6">
        {featuredGroups.map((g) => (
          <ProductRail
            key={g.slug}
            title={g.label}
            href={`/produk/grup/${g.slug}`}
            products={byGroup.get(g.slug) ?? []}
            stock={showcaseStock}
            catMap={catMap}
          />
        ))}
      </div>

      {/* Pita foto produk berjalan */}
      <div className="mt-12">
        <PhotoMarquee pics={marqueePics} />
      </div>

      {/* Cara belanja */}
      <HowToBuy />

      {/* Cabang */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
            Dua cabang, stok nyata
          </h2>
          <Link href="/cabang" className="text-sm font-semibold text-indigo-ink hover:underline">
            Detail &amp; peta →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {SITE.outlets.map((o) => (
            <BranchCard key={o.key} outlet={o} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <CtaBand />

      {/* WA cepat */}
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-2 text-center text-sm text-ink-soft sm:px-6">
        Butuh cepat?{" "}
        <a
          href={waLink(WA_PRIMARY, "Halo Akapack, saya mau tanya produk.")}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-success hover:underline"
        >
          Chat WhatsApp →
        </a>
      </div>
    </div>
  );
}
