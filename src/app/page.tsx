import Link from "next/link";
import { fetchCategories } from "@/lib/catalog";
import { buildCategoryGroups } from "@/lib/category-groups";
import { monogram } from "@/lib/format";
import { SITE, WA_PRIMARY, waLink } from "@/lib/site";

export default async function Home() {
  const categories = await fetchCategories();
  const groups = buildCategoryGroups(categories);

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
              Lebih dari 3.900 produk — plastik, kertas, box, hingga mesin pengemas.
              Harga grosir, stok nyata dari dua cabang.
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
              ["Produk", "3.900+"],
              ["Kategori", "109"],
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
              <span className="font-mono text-xs uppercase tracking-[0.08em]">{g.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Cabang */}
      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-medium tracking-tight">Dua cabang, stok nyata</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SITE.outlets.map((o) => (
              <div key={o.key} className="border border-line bg-card p-6">
                <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
                  {o.key === "bandung" ? "Cabang utama" : "Cabang"}
                </div>
                <h3 className="mt-2 font-display text-xl font-medium">{o.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{o.address}</p>
                <a
                  href={waLink(o.wa, `Halo ${o.name}, saya mau tanya stok.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block border border-ink px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
                >
                  WhatsApp {o.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
