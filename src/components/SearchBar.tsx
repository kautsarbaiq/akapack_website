"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { catalogHref } from "@/lib/catalog-url";

interface Props {
  initial: string | null;
  kategori: string | null;
  grup?: string | null;
  sort: string | null;
}

export function SearchBar({ initial, kategori, grup = null, sort }: Props) {
  const [value, setValue] = useState(initial ?? "");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(catalogHref({ q: value.trim() || null, kategori, grup, sort }));
      }}
      className="flex w-full items-center border border-line bg-card focus-within:border-ink/40 sm:w-80"
      role="search"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ml-3 text-ink-soft">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
        <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari nama / SKU / barcode…"
        className="w-full bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-ink-soft"
        aria-label="Cari produk"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            router.push(catalogHref({ kategori, grup, sort }));
          }}
          aria-label="Bersihkan"
          className="px-2 text-ink-soft hover:text-ink"
        >
          ×
        </button>
      )}
      <button type="submit" className="border-l border-line px-3 py-2 font-mono text-xs text-ink hover:bg-paper-2">
        Cari
      </button>
    </form>
  );
}
