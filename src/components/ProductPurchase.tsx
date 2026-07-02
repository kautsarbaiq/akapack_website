"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { WA_PRIMARY, waLink } from "@/lib/site";
import { cartToWhatsAppText } from "@/lib/wa";

export function ProductPurchase({ item }: { item: Omit<CartItem, "qty"> }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const waText = cartToWhatsAppText([
    { name: item.name, sku: item.sku, unit: item.unit, price: item.price, qty },
  ]);

  const stepBtn =
    "flex h-11 w-11 items-center justify-center text-xl text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink";

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-ink">Jumlah</span>
        <div className="flex items-center overflow-hidden rounded-full border border-line">
          <button type="button" aria-label="Kurangi" onClick={() => setQty((q) => Math.max(1, q - 1))} className={stepBtn}>
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
            className="h-11 w-16 border-x border-line bg-transparent text-center text-sm font-bold outline-none"
            aria-label="Jumlah"
          />
          <button type="button" aria-label="Tambah" onClick={() => setQty((q) => q + 1)} className={stepBtn}>
            +
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-line pt-4">
        <span className="text-sm text-ink-soft">Subtotal</span>
        <span className="text-2xl font-extrabold tracking-tight text-indigo-ink">
          {formatRupiah(item.price * qty)}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            add(item, qty);
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1400);
          }}
          className="w-full rounded-full bg-indigo px-4 py-3.5 text-sm font-bold text-white shadow-card transition-all hover:opacity-90 active:scale-[0.99]"
        >
          {added ? "✓ Ditambahkan ke keranjang" : "+ Tambah ke Keranjang"}
        </button>
        <a
          href={waLink(WA_PRIMARY, waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-success px-4 py-3 text-sm font-bold text-success transition-colors hover:bg-success hover:text-white"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}
