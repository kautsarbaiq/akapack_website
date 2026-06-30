"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/keranjang"
      aria-label={`Keranjang${count > 0 ? `, ${count} item` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-card text-ink transition-colors hover:border-indigo/40 hover:text-indigo-ink"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      {hydrated && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-discount px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
