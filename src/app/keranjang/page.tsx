"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatRupiah, monogram } from "@/lib/format";
import { WA_PRIMARY, waLink } from "@/lib/site";
import { cartToWhatsAppText } from "@/lib/wa";

export default function CartPage() {
  const { items, subtotal, setQty, remove, count, hydrated } = useCart();

  if (!hydrated) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-ink-soft sm:px-6">Memuat keranjang…</div>;
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft">Keranjang</div>
        <h1 className="mt-3 font-display text-3xl font-medium">Keranjang masih kosong</h1>
        <p className="mt-3 text-ink-soft">Yuk jelajahi katalog dan tambahkan produk.</p>
        <Link
          href="/produk"
          className="mt-6 inline-block bg-indigo px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Lihat katalog
        </Link>
      </div>
    );
  }

  const waText = cartToWhatsAppText(
    items.map((i) => ({ name: i.name, sku: i.sku, unit: i.unit, price: i.price, qty: i.qty })),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft">Keranjang</div>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        {count} item
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Daftar item */}
        <ul className="divide-y divide-line border-y border-line">
          {items.map((it) => (
            <li key={it.id} className="flex gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-line">
                {it.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-mono text-2xl font-medium text-white/40"
                    style={{ backgroundColor: it.color || "#4f46e5" }}
                  >
                    {monogram(it.name)}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/produk/${it.id}`} className="line-clamp-2 text-sm font-medium hover:text-indigo-ink">
                  {it.name}
                </Link>
                <span className="font-mono text-xs text-ink-soft">
                  {it.sku ? `${it.sku} · ` : ""}{formatRupiah(it.price)}/{it.unit ?? "pcs"}
                </span>

                <div className="mt-auto flex items-center gap-3 pt-2">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      aria-label="Kurangi"
                      onClick={() => setQty(it.id, it.qty - 1)}
                      className="flex h-8 w-8 items-center justify-center hover:bg-paper-2"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-mono text-sm">{it.qty}</span>
                    <button
                      type="button"
                      aria-label="Tambah"
                      onClick={() => setQty(it.id, it.qty + 1)}
                      className="flex h-8 w-8 items-center justify-center hover:bg-paper-2"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="font-mono text-xs text-ink-soft hover:text-ink"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right text-sm font-medium">
                {formatRupiah(it.price * it.qty)}
              </div>
            </li>
          ))}
        </ul>

        {/* Ringkasan */}
        <div className="h-fit border border-line bg-card p-5 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <span className="text-sm text-ink-soft">Subtotal</span>
            <span className="font-display text-2xl font-medium">{formatRupiah(subtotal)}</span>
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Ongkos kirim & konfirmasi stok dihitung saat checkout atau via WhatsApp.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/checkout"
              className="w-full bg-indigo px-4 py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Lanjut checkout
            </Link>
            <a
              href={waLink(WA_PRIMARY, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 border border-ink px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
