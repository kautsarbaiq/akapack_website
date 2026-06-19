import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang kami",
  description:
    "Akapack — pusat grosir kemasan plastik, kertas, dan mesin pengemas di Bandung & Garut. Harga grosir, stok lengkap, dua cabang.",
};

const VALUES = [
  {
    title: "Harga grosir",
    body: "Harga langsung untuk pembelian banyak — cocok untuk warung, UMKM, katering, hingga pabrik kecil.",
  },
  {
    title: "Stok lengkap",
    body: "3.900+ produk: plastik, kertas, box, mika, paper bag, sampai mesin pengemas dalam satu katalog.",
  },
  {
    title: "Dua cabang",
    body: "Akapack Bandung & Toko Kemasan Garut. Stok ditampilkan nyata per cabang, tersinkron langsung dengan kasir.",
  },
  {
    title: "Mesin & konsultasi",
    body: "Bukan cuma kemasan — kami juga sediakan mesin pengemas dan siap bantu pilih lewat WhatsApp.",
  },
];

const STEPS = [
  ["Pilih produk", "Telusuri katalog atau cari nama/SKU, lalu tambahkan ke keranjang."],
  ["Checkout atau WhatsApp", "Isi data pesanan di web, atau kirim keranjang langsung via WhatsApp."],
  ["Ambil atau dikirim", "Ambil di cabang terdekat atau minta dikirim. Bayar transfer / COD."],
];

export default function TentangPage() {
  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Tentang kami</div>
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

      {/* Nilai */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-medium tracking-tight">Kenapa Akapack</h2>
        <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <div key={v.title} className="bg-card p-6">
              <div className="font-mono text-xs text-ink-soft">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 font-display text-lg font-medium">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistik */}
      <section className="border-y border-line bg-paper-2">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px border-x border-line bg-line sm:grid-cols-3">
          {[
            ["3.900+", "Produk aktif"],
            ["109", "Kategori"],
            ["2", "Cabang"],
          ].map(([n, l]) => (
            <div key={l} className="bg-paper-2 px-6 py-10 text-center">
              <div className="font-display text-4xl font-medium">{n}</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cara belanja */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-medium tracking-tight">Cara belanja</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map(([t, b], i) => (
            <div key={t} className="border border-line bg-card p-6">
              <div className="font-display text-3xl font-medium text-indigo">{i + 1}</div>
              <h3 className="mt-3 font-medium">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/produk" className="inline-block bg-indigo px-6 py-3 text-sm font-medium text-white hover:opacity-90">
            Mulai dari katalog
          </Link>
        </div>
      </section>
    </div>
  );
}
