"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/keranjang"
      aria-label={`Keranjang${count > 0 ? `, ${count} item` : ""}`}
      className="relative flex h-9 w-9 items-center justify-center border border-line bg-card text-ink transition-colors hover:border-ink/30"
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
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-indigo px-1 font-mono text-[11px] font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
