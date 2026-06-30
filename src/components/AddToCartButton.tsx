"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";

interface Props {
  item: Omit<CartItem, "qty">;
  qty?: number;
  className?: string;
  label?: string;
}

export function AddToCartButton({ item, qty = 1, className, label = "+ Keranjang" }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(item, qty);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className={
        className ??
        "flex-1 rounded-lg bg-indigo px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      }
    >
      {added ? "✓ Ditambahkan" : label}
    </button>
  );
}
