import Link from "next/link";

const STEPS: [string, string][] = [
  ["Pilih produk", "Telusuri katalog atau cari nama/SKU, lalu tambahkan ke keranjang."],
  ["Checkout atau WhatsApp", "Isi data pesanan di web, atau kirim isi keranjang langsung via WhatsApp."],
  ["Ambil atau dikirim", "Ambil di cabang terdekat atau minta dikirim. Bayar transfer atau COD."],
];

/** Tiga langkah belanja — dipakai di beranda & halaman Tentang. */
export function HowToBuy({ withCta = false }: { withCta?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-2xl font-medium tracking-tight">Cara belanja</h2>
      <p className="mt-2 max-w-xl text-ink-soft">Tiga langkah, dari pilih sampai barang di tangan.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map(([t, b], i) => (
          <div key={t} className="border border-line bg-card p-6">
            <div className="font-display text-3xl font-medium text-indigo">{i + 1}</div>
            <h3 className="mt-3 font-medium">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b}</p>
          </div>
        ))}
      </div>
      {withCta && (
        <div className="mt-8">
          <Link
            href="/produk"
            className="inline-block bg-indigo px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Mulai dari katalog
          </Link>
        </div>
      )}
    </section>
  );
}
