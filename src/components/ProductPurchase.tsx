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

  return (
    <div className="border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Jumlah</span>
        <div className="flex items-center border border-line">
          <button
            type="button"
            aria-label="Kurangi"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-lg hover:bg-paper-2"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
            className="h-10 w-14 border-x border-line bg-transparent text-center font-mono text-sm outline-none"
            aria-label="Jumlah"
          />
          <button
            type="button"
            aria-label="Tambah"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-lg hover:bg-paper-2"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-soft">Subtotal</span>
        <span className="font-display text-2xl font-medium">{formatRupiah(item.price * qty)}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            add(item, qty);
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1400);
          }}
          className="w-full bg-indigo px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {added ? "✓ Ditambahkan ke keranjang" : "+ Tambah ke keranjang"}
        </button>
        <a
          href={waLink(WA_PRIMARY, waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 border border-ink px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}
