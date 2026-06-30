import Link from "next/link";
import Image from "next/image";
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
import {
  buildCategoryGroups,
  countByGroup,
  groupDefaultOrder,
  groupSlugFor,
} from "@/lib/category-groups";
import { monogram } from "@/lib/format";
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
      fetchProductsPage({ page: 1, pageSize: 24, sort: "name" }),
      fetchGroupSettings(),
      fetchProductsWithImages(1500),
      fetchBanners(),
    ]);
  const groups = buildCategoryGroups(categories);
  const groupCounts = countByGroup(categories, byCategory);

  // Bucket produk berfoto per grup → untuk foto kartu kategori + etalase per kategori.
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
        color: g.categories[0]?.color || "#4f46e5",
        image: s?.image_url || groupImg.get(g.slug) || null,
        count: groupCounts.get(g.slug) ?? 0,
        order: s?.sort_order ?? groupDefaultOrder(g.slug),
        active: s?.is_active ?? true,
      };
    })
    .filter((g) => g.active)
    .sort((a, b) => a.order - b.order);

  // Etalase produk per kategori (gaya ramesia) — grup dgn cukup foto, urut tampil.
  const featuredGroups = displayGroups
    .filter((g) => (byGroup.get(g.slug)?.length ?? 0) >= 4)
    .slice(0, 10);
  const showcaseStock = await fetchStockFor(
    featuredGroups.flatMap((g) => (byGroup.get(g.slug) ?? []).map((p) => p.id)),
  );

  // Pita foto produk (marquee) — satu foto per kategori berfoto, untuk kesan "banyak gambar".
  const marqueePics = displayGroups
    .map((g) => {
      const src = groupImg.get(g.slug);
      return src ? { src, label: g.label, href: `/produk/grup/${g.slug}` } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 18);

  // Etalase: utamakan produk berfoto, lengkapi dengan sisanya.
  const pool = featured.products;
  const showcase = [
    ...pool.filter((p) => p.image_url),
    ...pool.filter((p) => !p.image_url),
  ].slice(0, 12);
  const stock = await fetchStockFor(showcase.map((p) => p.id));
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const fmt = new Intl.NumberFormat("id-ID");

  return (
    <div>
      {/* Banner hero (full-width, geser + auto-scroll). Diisi via Dashboard → Banner. */}
      {banners.length > 0 ? (
        <HeroCarousel slides={banners} />
      ) : (
        <section className="bg-ink text-white">
          <div className="mx-auto flex min-h-[300px] max-w-6xl flex-col items-start justify-center gap-4 px-4 py-14 sm:min-h-[460px] sm:px-6 lg:min-h-[580px]">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-orange">
              Grosir kemasan &amp; mesin · Bandung — Garut
            </div>
            <h2 className="max-w-3xl font-display text-4xl font-medium leading-tight sm:text-5xl">
              Grosir kemasan plastik &amp; mesin pengemas.
            </h2>
            <p className="max-w-xl text-white/70">
              Poster produk akan tampil di sini — tambahkan lewat Dashboard → Banner.
            </p>
            <Link
              href="/produk"
              className="mt-2 bg-indigo px-6 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Lihat katalog
            </Link>
          </div>
        </section>
      )}

      {/* Intro */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
            Grosir kemasan &amp; mesin · Bandung — Garut
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            Grosir kemasan plastik &amp; mesin pengemas, satu tempat.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Lebih dari {fmt.format(total)} produk — plastik, kertas, box, hingga mesin pengemas.
            Harga grosir, stok nyata dari dua cabang.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/produk"
                className="bg-indigo px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Lihat katalog
              </Link>
              <a
                href={waLink(WA_PRIMARY, "Halo Akapack, saya mau tanya produk.")}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-ink px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Pesan via WhatsApp
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                [fmt.format(total), "produk"],
                [String(categories.length), "kategori"],
                ["2", "cabang"],
              ].map(([n, l]) => (
                <div key={l}>
                  <span className="font-display text-2xl font-medium">{n}</span>{" "}
                  <span className="font-mono text-xs text-ink-soft">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pita foto produk berjalan */}
      <PhotoMarquee pics={marqueePics} />

      {/* Kategori unggulan */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-medium tracking-tight">Jelajahi kategori</h2>
          <Link href="/produk" className="font-mono text-xs text-indigo-ink hover:underline">
            Semua kategori →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {displayGroups.map((g) => (
            <Link
              key={g.slug}
              href={`/produk/grup/${g.slug}`}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden p-3 text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: g.color }}
            >
              {g.image ? (
                <>
                  <Image
                    src={g.image}
                    alt={g.label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </>
              ) : (
                <span className="font-mono text-[64px] font-medium leading-none text-white/30">
                  {monogram(g.label)}
                </span>
              )}
              <span className="relative">
                <span className="block font-mono text-xs uppercase tracking-[0.08em]">{g.label}</span>
                <span className="mt-0.5 block font-mono text-[11px] text-white/80">
                  {fmt.format(g.count)} produk
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Etalase produk */}
      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium tracking-tight">Cuplikan katalog</h2>
            <Link href="/produk" className="font-mono text-xs text-indigo-ink hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {showcase.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={p.category_id ? catMap.get(p.category_id) : null}
                stock={stock[p.id]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Etalase produk per kategori (gaya ramesia) */}
      {featuredGroups.map((g) => {
        const items = byGroup.get(g.slug) ?? [];
        return (
          <section key={g.slug} className="border-t border-line">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-2xl font-medium tracking-tight">{g.label}</h2>
                <Link
                  href={`/produk/grup/${g.slug}`}
                  className="font-mono text-xs text-indigo-ink hover:underline"
                >
                  Lihat semua {fmt.format(g.count)} →
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    category={p.category_id ? catMap.get(p.category_id) : null}
                    stock={showcaseStock[p.id]}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Cara belanja */}
      <div className="border-t border-line">
        <HowToBuy />
      </div>

      {/* Cabang */}
      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Dua cabang, stok nyata
            </h2>
            <Link href="/cabang" className="font-mono text-xs text-indigo-ink hover:underline">
              Detail &amp; peta →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SITE.outlets.map((o) => (
              <BranchCard key={o.key} outlet={o} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaBand />
    </div>
  );
}
