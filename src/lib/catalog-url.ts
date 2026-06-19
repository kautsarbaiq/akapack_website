export interface CatalogParams {
  q?: string | null;
  kategori?: string | null;
  sort?: string | null;
  hal?: number | null;
}

/** Bangun URL katalog yang konsisten, hanya menyertakan param yang bermakna. */
export function catalogHref(params: CatalogParams): string {
  const u = new URLSearchParams();
  if (params.q) u.set("q", params.q);
  if (params.kategori) u.set("kategori", params.kategori);
  if (params.sort && params.sort !== "name") u.set("sort", params.sort);
  if (params.hal && params.hal > 1) u.set("hal", String(params.hal));
  const s = u.toString();
  return s ? `/produk?${s}` : "/produk";
}
