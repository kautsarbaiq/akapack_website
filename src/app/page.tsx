import Link from "next/link";
import {
  fetchCategories,
  fetchCategoryCounts,
  fetchProductsPage,
  fetchStockFor,
} from "@/lib/catalog";
import { buildCategoryGroups, countByGroup } from "@/lib/category-groups";
import { monogram } from "@/lib/format";
import { SITE, WA_PRIMARY, waLink } from "@/lib/site";
import { ProductCard } from "@/components/ProductCard";
import { HowToBuy } from "@/components/HowToBuy";
import { CtaBand } from "@/components/CtaBand";
import { BranchCard } from "@/components/BranchCard";

const FEATURES: [string, string][] = [
  ["Harga grosir", "Harga langsung untuk pembelian banyak — tanpa nego panjang."],
  ["Stok nyata 2 cabang", "Jumlah stok Bandung & Garut tampil apa adanya, sinkron dengan kasir."],
  ["Katalog lengkap", "Plastik, kertas, box, mika, sampai mesin pengemas dalam satu tempat."],
  ["Mesin & konsultasi", "Bukan cuma kemasan — kami bantu pilih mesin yang pas via WhatsApp."],
];

export default async function Home() {
  const [categories, { byCategory, total }, featured] = await Promise.all([
    fetchCategories(),
    fetchCategoryCounts(),
    fetchProductsPage({ page: 1, pageSize: 24, sort: "name" }),
  ]);
  const groups = buildCategoryGroups(categories);
  const groupCounts = countByGroup(categories, byCategory);

  // Etalase: utamakan produk berfoto, lengkapi dengan sisanya.
  const pool = featured.products;
  const showcase = [
    ...pool.filter((p) => p.image_url),
    ...pool.filter((p) => !p.image_url),
  ].slice(0, 8);
  const stock = await fetchStockFor(showcase.map((p) => p.id));
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const fmt = new Intl.NumberFormat("id-ID");

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:py-24">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
              Grosir kemasan &amp; mesin · Bandung — Garut
            </div>
            <h1 className="mt-5 font-display text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl">
              Semua kebutuhan kemasan usahamu, satu tempat.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Lebih dari {fmt.format(total)} produk — plastik, kertas, box, hingga mesin
              pengemas. Harga grosir, stok nyata dari dua cabang.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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
          </div>

          {/* Spec sheet ala katalog */}
          <div className="self-end border border-line bg-card">
            {[
              ["Produk", fmt.format(total)],
              ["Kategori", String(categories.length)],
              ["Cabang", "Bandung & Garut"],
              ["Pembayaran", "Transfer · COD"],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={
                  "flex items-baseline justify-between px-5 py-4" +
                  (i > 0 ? " border-t border-line" : "")
                }
              >
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
                  {k}
                </span>
                <span className="font-display text-xl font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="border-b border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(([t, b], i) => (
              <div key={t} className="bg-card p-6">
                <div className="font-mono text-xs text-ink-soft">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-display text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategori unggulan */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-medium tracking-tight">Jelajahi kategori</h2>
          <Link href="/produk" className="font-mono text-xs text-indigo-ink hover:underline">
            Semua kategori →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {groups.map((g) => (
            <Link
              key={g.slug}
              href={`/produk?grup=${g.slug}`}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden p-3 text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: g.categories[0]?.color || "#4f46e5" }}
            >
              <span className="font-mono text-[64px] font-medium leading-none text-white/30">
                {monogram(g.label)}
              </span>
              <span>
                <span className="block font-mono text-xs uppercase tracking-[0.08em]">
                  {g.label}
                </span>
                <span className="mt-0.5 block font-mono text-[11px] text-white/70">
                  {fmt.format(groupCounts.get(g.slug) ?? 0)} produk
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
