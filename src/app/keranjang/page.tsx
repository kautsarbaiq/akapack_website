"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-paper-2">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink-soft">
            <path
              d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
            <circle cx="17.5" cy="20" r="1.3" fill="currentColor" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Keranjang masih kosong</h1>
        <p className="mt-2 text-ink-soft">Yuk jelajahi katalog dan tambahkan produk.</p>
        <Link
          href="/produk"
          className="mt-6 inline-block rounded-full bg-indigo px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Lihat Katalog
        </Link>
      </div>
    );
  }

  const waText = cartToWhatsAppText(
    items.map((i) => ({ name: i.name, sku: i.sku, unit: i.unit, price: i.price, qty: i.qty })),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Keranjang <span className="text-base font-semibold text-ink-soft">({count} item)</span>
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Daftar item */}
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="flex gap-4 rounded-xl border border-line bg-card p-4 shadow-card">
              <Link
                href={`/produk/${it.id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-paper-2"
              >
                {it.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink-soft/40">
                      <path
                        d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2V8.2ZM12 3v9m0 9v-9m9-3.8L12 12 3 8.2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/produk/${it.id}`} className="line-clamp-2 text-sm font-semibold hover:text-indigo-ink">
                  {it.name}
                </Link>
                <span className="mt-0.5 text-xs text-ink-soft">
                  {it.sku ? `${it.sku} · ` : ""}
                  {formatRupiah(it.price)}/{it.unit ?? "pcs"}
                </span>

                <div className="mt-auto flex items-center gap-3 pt-2">
                  <div className="flex items-center overflow-hidden rounded-full border border-line">
                    <button
                      type="button"
                      aria-label="Kurangi"
                      onClick={() => setQty(it.id, it.qty - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft hover:bg-paper-2 hover:text-ink"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{it.qty}</span>
                    <button
                      type="button"
                      aria-label="Tambah"
                      onClick={() => setQty(it.id, it.qty + 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft hover:bg-paper-2 hover:text-ink"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="text-xs font-medium text-ink-soft transition-colors hover:text-discount"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right text-sm font-extrabold text-indigo-ink">
                {formatRupiah(it.price * it.qty)}
              </div>
            </li>
          ))}
        </ul>

        {/* Ringkasan */}
        <div className="h-fit rounded-2xl border border-line bg-card p-5 shadow-card lg:sticky lg:top-36">
          <h2 className="text-sm font-bold text-ink">Ringkasan Belanja</h2>
          <div className="mt-3 flex items-baseline justify-between border-b border-dashed border-line pb-4">
            <span className="text-sm text-ink-soft">Subtotal ({count} item)</span>
            <span className="text-2xl font-extrabold tracking-tight text-indigo-ink">
              {formatRupiah(subtotal)}
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            Ongkos kirim & konfirmasi stok dihitung saat checkout atau via WhatsApp.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/checkout"
              className="w-full rounded-full bg-indigo px-4 py-3.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Lanjut Checkout
            </Link>
            <a
              href={waLink(WA_PRIMARY, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-success px-4 py-3 text-sm font-bold text-success transition-colors hover:bg-success hover:text-white"
            >
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
