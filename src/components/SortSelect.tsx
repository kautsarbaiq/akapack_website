"use client";

import { useRouter } from "next/navigation";
import { catalogHref } from "@/lib/catalog-url";

interface Props {
  value: string;
  q: string | null;
  kategori: string | null;
}

export function SortSelect({ value, q, kategori }: Props) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-xs text-ink-soft">
      <span className="font-mono uppercase tracking-[0.1em]">Urut</span>
      <select
        value={value}
        onChange={(e) => router.push(catalogHref({ q, kategori, sort: e.target.value }))}
        className="border border-line bg-card px-2.5 py-2 text-sm text-ink outline-none focus:border-ink/40"
      >
        <option value="name">Nama A–Z</option>
        <option value="price_asc">Harga termurah</option>
        <option value="price_desc">Harga termahal</option>
      </select>
    </label>
  );
}
