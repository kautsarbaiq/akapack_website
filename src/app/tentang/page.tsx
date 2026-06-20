import type { Metadata } from "next";
import Link from "next/link";
import { fetchCategories, fetchCategoryCounts } from "@/lib/catalog";
import { buildCategoryGroups, countByGroup } from "@/lib/category-groups";
import { SITE, SITE_URL } from "@/lib/site";
import { HowToBuy } from "@/components/HowToBuy";
import { CtaBand } from "@/components/CtaBand";
import { BranchCard } from "@/components/BranchCard";

export const metadata: Metadata = {
  title: "Tentang Kami — Grosir Kemasan Bandung & Garut",
  description:
    "Akapack — pusat grosir kemasan plastik, kertas, dan mesin pengemas di Bandung & Garut. Harga grosir, stok lengkap, dua cabang.",
  alternates: { canonical: "/tentang" },
};

const VALUES: [string, string][] = [
  ["Harga grosir", "Harga langsung untuk pembelian banyak — cocok untuk warung, UMKM, katering, hingga pabrik kecil."],
  ["Stok lengkap", "Ribuan produk: plastik, kertas, box, mika, paper bag, sampai mesin pengemas dalam satu katalog."],
  ["Stok nyata per cabang", "Jumlah stok ditampilkan apa adanya per cabang, tersinkron langsung dengan kasir toko."],
  ["Dua cabang", "Akapack Bandung & Toko Kemasan Garut — ambil sendiri atau minta dikirim."],
  ["Mesin & konsultasi", "Bukan cuma kemasan: kami sediakan mesin pengemas dan bantu pilih lewat WhatsApp."],
  ["Belanja fleksibel", "Checkout di web atau kirim keranjang langsung ke WhatsApp. Bayar transfer atau COD."],
];

const SEGMENTS: [string, string][] = [
  ["UMKM kuliner", "Warung, gerobak, hingga frozen food rumahan."],
  ["Katering & rumah makan", "Box nasi, kemasan sekali pakai, peralatan saji."],
  ["Kafe & kedai minuman", "Cup, gelas, sedotan, lid, paper bag."],
  ["Toko kue & bakery", "Loyang, cup cake, mika, dus kue, alat baking."],
  ["Online seller", "Bubble wrap, polymailer, lakban, kemasan aman kirim."],
  ["Pabrik & produsen kecil", "Mesin pengemas, sealer, plastik roll, karung."],
];

const FAQ: [string, string][] = [
  ["Apakah harus beli banyak (grosir)?", "Tidak wajib. Kamu bisa beli eceran maupun grosir. Untuk pembelian banyak, sebagian produk punya harga grosir bertingkat."],
  ["Bagaimana cara memesan?", "Pilih produk di katalog, tambahkan ke keranjang, lalu checkout di web — atau kirim isi keranjang langsung ke WhatsApp kami."],
  ["Metode pembayaran apa saja?", "Transfer bank dan COD (bayar di tempat) untuk area tertentu. Detail dikonfirmasi saat pemesanan."],
  ["Apakah bisa dikirim?", "Bisa. Ambil sendiri di cabang Bandung atau Garut, atau minta dikirim — ongkir menyesuaikan tujuan."],
  ["Stok yang tampil di web apakah nyata?", "Ya. Jumlah stok per cabang tampil apa adanya dan tersinkron dengan kasir toko."],
  ["Apakah Akapack menjual mesin pengemas?", "Ya, kami sediakan mesin pengemas (sealer dan lainnya) plus bantu konsultasi memilih yang sesuai kebutuhan."],
];

export default async function TentangPage() {
  const [categories, { byCategory, total }] = await Promise.all([
    fetchCategories(),
    fetchCategoryCounts(),
  ]);
  const groups = buildCategoryGroups(categories);
  const groupCounts = countByGroup(categories, byCategory);
  const fmt = new Intl.NumberFormat("id-ID");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/tentang#faq`,
    url: `${SITE_URL}/tentang`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#org` },
    mainEntity: FAQ.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
            Tentang kami
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            Mitra grosir kemasan untuk setiap usaha.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Akapack adalah pusat grosir kemasan plastik, kertas, dan mesin pengemas yang melayani
            pelaku usaha di Bandung, Garut, dan sekitarnya. Dari satu bungkus sampai satuan dus,
            kami sediakan dengan harga grosir dan stok yang jelas.
          </p>
        </div>
      </section>

      {/* Cerita singkat */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="font-display text-2xl font-medium leading-snug tracking-tight">
            Dari toko kemasan, untuk usaha yang sedang tumbuh.
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-ink-soft">
            <p>
              Akapack berawal dari toko kemasan yang melayani pedagang dan pelaku UMKM di Bandung
              dan Garut. Setiap hari kami melihat hal yang sama: pemilik usaha butuh kemasan yang
              tepat, harga yang masuk akal, dan stok yang benar-benar ada saat dibutuhkan.
            </p>
            <p>
              Karena itu kami kumpulkan ribuan produk — dari plastik, kertas, box, mika, sampai
              mesin pengemas — dalam satu katalog dengan harga grosir. Stok dari dua cabang
              ditampilkan apa adanya, langsung tersinkron dengan kasir, supaya kamu tidak datang
              jauh-jauh hanya untuk menemukan barang kosong.
            </p>
            <p>
              Mau beli satuan atau dalam jumlah besar, ambil di toko atau dikirim — kami siap bantu,
              termasuk memilih mesin pengemas yang sesuai skala usahamu.
            </p>
          </div>
        </div>
      </section>

      {/* Nilai */}
      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-medium tracking-tight">Kenapa Akapack</h2>
          <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <div key={v[0]} className="bg-card p-6">
                <div className="font-mono text-xs text-ink-soft">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-display text-lg font-medium">{v[0]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="border-y border-line bg-paper-2">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px border-x border-line bg-line lg:grid-cols-4">
          {[
            [fmt.format(total), "Produk aktif"],
            [String(categories.length), "Kategori"],
            ["2", "Cabang"],
            ["08–17", "Senin–Sabtu"],
          ].map(([n, l]) => (
            <div key={l} className="bg-paper-2 px-6 py-10 text-center">
              <div className="font-display text-4xl font-medium">{n}</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apa yang kami sediakan */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-medium tracking-tight">Apa yang kami sediakan</h2>
          <Link href="/produk" className="font-mono text-xs text-indigo-ink hover:underline">
            Buka katalog →
          </Link>
        </div>
        <p className="mt-2 max-w-xl text-ink-soft">
          Ribuan produk tersusun dalam beberapa kelompok besar. Klik untuk menelusuri.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g.slug}
              href={`/produk?grup=${g.slug}`}
              className="flex items-center justify-between gap-4 border border-line bg-card p-5 transition-colors hover:border-ink/25 hover:bg-paper-2"
            >
              <span className="font-medium">{g.label}</span>
              <span className="font-mono text-xs text-ink-soft">
                {fmt.format(groupCounts.get(g.slug) ?? 0)} produk
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Untuk siapa */}
      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-medium tracking-tight">Cocok untuk usaha</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SEGMENTS.map(([t, b]) => (
              <div key={t} className="border border-line bg-card p-6">
                <h3 className="font-display text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara belanja */}
      <div className="border-t border-line">
        <HowToBuy withCta />
      </div>

      {/* Cabang */}
      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium tracking-tight">Kunjungi cabang</h2>
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

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-medium tracking-tight">Pertanyaan umum</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border border-line bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}
                <span className="font-mono text-lg leading-none text-ink-soft transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <CtaBand />
    </div>
  );
}
