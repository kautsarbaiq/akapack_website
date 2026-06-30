"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Search bar besar di header (gaya marketplace) → arahkan ke /produk?q= */
export function HeaderSearch({ className = "" }: { className?: string }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        router.push(v ? `/produk?q=${encodeURIComponent(v)}` : "/produk");
      }}
      className={
        "flex h-11 items-center overflow-hidden rounded-full border-2 border-indigo/70 bg-card focus-within:border-indigo " +
        className
      }
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="ml-4 shrink-0 text-ink-soft"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari kemasan, cup, mesin, atau SKU…"
        aria-label="Cari produk"
        className="h-full w-full bg-transparent px-3 text-sm outline-none placeholder:text-ink-soft"
      />
      <button
        type="submit"
        className="m-1 h-9 shrink-0 rounded-full bg-indigo px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Cari
      </button>
    </form>
  );
}
