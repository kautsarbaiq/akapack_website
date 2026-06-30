"use client";

import { useRouter } from "next/navigation";
import { catalogHref } from "@/lib/catalog-url";

interface Props {
  value: string;
  q: string | null;
  kategori: string | null;
  grup?: string | null;
}

export function SortSelect({ value, q, kategori, grup = null }: Props) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-xs text-ink-soft">
      <span className="font-medium">Urutkan</span>
      <select
        value={value}
        onChange={(e) => router.push(catalogHref({ q, kategori, grup, sort: e.target.value }))}
        className="rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-indigo/50"
      >
        <option value="name">Nama A–Z</option>
        <option value="price_asc">Harga termurah</option>
        <option value="price_desc">Harga termahal</option>
      </select>
    </label>
  );
}
