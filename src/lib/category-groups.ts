import type { Category } from "./types";

/**
 * 109 kategori di DB berantakan & banyak duplikat (mis. "Kantong Keresek" vs
 * "KRESEK", "Papercup" vs "Paperpcup"). Untuk navigasi yang ringkas, tiap
 * kategori dipetakan ke salah satu grup induk via keyword. Urutan = prioritas
 * (match pertama menang), jadi aturan spesifik diletakkan di atas yang umum.
 */
export interface CategoryGroupDef {
  slug: string;
  label: string;
  patterns: RegExp;
}

export const CATEGORY_GROUPS: CategoryGroupDef[] = [
  { slug: "mesin", label: "Mesin & Alat", patterns: /mesin|spare ?part|sperpart|timbangan|elektronik|^service$/i },
  { slug: "baking", label: "Baking & Dapur", patterns: /baking|cupcake|cup cake|loyang|cetakan|tatakan|spatula|silikon|tusuk gigi|saringan|mangkok|piring|sendok|garpu|pisau|^nasi$|kitchen|kicthen/i },
  { slug: "cup", label: "Cup, Gelas & Tutup", patterns: /cup|gelas|sedotan|jellycup|\blid\b|tutup/i },
  { slug: "botol", label: "Botol, Toples & Jar", patterns: /botol|toples|\bjar\b|tabung/i },
  { slug: "box", label: "Box, Mika & Tray", patterns: /box|mika|tray|thinwall|\bdus\b|bento|foam/i },
  { slug: "plastik", label: "Plastik & Kantong", patterns: /kresek|keresek|kantong|plastik|wrap|polynett|sarung tangan|jas hujan|bubble|karung|segel/i },
  { slug: "kertas", label: "Kertas & Cetak", patterns: /paper|kertas|amplop|kraft|sleeve|stiker|pita|cetak|drip bag/i },
  { slug: "pangan", label: "Bahan & Pangan", patterns: /anti tengik|bumbu|kadar gula|makanan|minuman|sauce/i },
  { slug: "kemasan", label: "Kemasan Lain", patterns: /kemasan/i },
];

export const OTHER_GROUP = { slug: "lainnya", label: "Lainnya" };

/** Slug grup untuk satu nama kategori (fallback ke "lainnya"). */
export function groupSlugFor(name: string): string {
  for (const g of CATEGORY_GROUPS) if (g.patterns.test(name)) return g.slug;
  return OTHER_GROUP.slug;
}

export interface CategoryGroup {
  slug: string;
  label: string;
  categories: Category[];
}

/** Susun daftar kategori jadi grup induk berurutan (grup kosong dibuang). */
export function buildCategoryGroups(categories: Category[]): CategoryGroup[] {
  const byGroup = new Map<string, Category[]>();
  for (const c of categories) {
    const slug = groupSlugFor(c.name);
    const list = byGroup.get(slug) ?? [];
    list.push(c);
    byGroup.set(slug, list);
  }

  const ordered: CategoryGroup[] = [];
  for (const g of CATEGORY_GROUPS) {
    const cats = byGroup.get(g.slug);
    if (cats?.length) ordered.push({ slug: g.slug, label: g.label, categories: cats });
  }
  const others = byGroup.get(OTHER_GROUP.slug);
  if (others?.length)
    ordered.push({ slug: OTHER_GROUP.slug, label: OTHER_GROUP.label, categories: others });
  return ordered;
}

/** Semua id kategori dalam satu grup (untuk filter produk per-grup). */
export function categoryIdsForGroup(categories: Category[], slug: string): string[] {
  return categories.filter((c) => groupSlugFor(c.name) === slug).map((c) => c.id);
}

/** Total produk per grup induk, dari hitungan per-kategori (lihat fetchCategoryCounts). */
export function countByGroup(
  categories: Category[],
  byCategory: Map<string, number>,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const c of categories) {
    const slug = groupSlugFor(c.name);
    out.set(slug, (out.get(slug) ?? 0) + (byCategory.get(c.id) ?? 0));
  }
  return out;
}

export function groupLabel(slug: string): string {
  return (
    CATEGORY_GROUPS.find((g) => g.slug === slug)?.label ??
    (slug === OTHER_GROUP.slug ? OTHER_GROUP.label : slug)
  );
}
