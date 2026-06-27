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

// Urutan = urutan tampil di beranda (arahan ibu, 2026-06-27). Pola dibuat
// SPESIFIK agar tiap kategori DB (yang sudah dirapikan) jatuh ke grup yang benar.
export const CATEGORY_GROUPS: CategoryGroupDef[] = [
  { slug: "flexibel", label: "Kemasan Flexibel (Pouch, Sachet)", patterns: /flexibel|standing pouch|gusset|sachet|kemasan flexi|one layer|drip bag/i },
  { slug: "botol", label: "Botol, Toples & Tabung Plastik", patterns: /botol|& tabung plastik|jar & tabung|tumbler/i },
  { slug: "cup", label: "Cup & Gelas Plastik", patterns: /cup gelas plastik|jellycup|jelly cup|sedotan|lid plastik/i },
  { slug: "thinwall", label: "Wadah Thinwall", patterns: /thinwall|thin wall/i },
  { slug: "toples-kue", label: "Toples Kue Kering", patterns: /kue kering|cookies/i },
  { slug: "tray", label: "Tray Plastik (Puding, Cake)", patterns: /\btray\b|mochi|puding|cool box/i },
  { slug: "bento", label: "Bento / Kotak Makan", patterns: /bento|kotak makan/i },
  { slug: "sendok", label: "Sendok, Garpu, Sumpit", patterns: /sendok|garpu|sumpit|pisau plastik|tusuk gigi/i },
  { slug: "kaleng", label: "Kemasan Kaleng", patterns: /kemasan kaleng/i },
  { slug: "aluma", label: "Tabung Aluma / Composite", patterns: /aluma|composite|cetak kemasan aluma/i },
  { slug: "bambu", label: "Produk Bambu", patterns: /bambu|anyaman/i },
  { slug: "papercup", label: "Gelas Paper Cup", patterns: /papper cup|paper cup|gelas papper/i },
  { slug: "paperbox", label: "Paper Box (Kraft, Ivory)", patterns: /papper box|paper box|kraft|ivory|corrugat|paper rice|\bdus\b|popcorn/i },
  { slug: "tas", label: "Tas Woven & Shopping Bag", patterns: /tas woven|woven|shoping bag|shopping bag/i },
  { slug: "kantong", label: "Kantong Plastik & Kresek", patterns: /kantong plastik|kresek|keresek|polymailer|sarung tangan|jas hujan|polynett|foamnett|bubble|segel|lakban|wraping|^plastik$|paper ?bag/i },
  { slug: "alufoil", label: "Wadah Alu Foil", patterns: /aluminium foil|alu foil|alufoil|cup aluminium/i },
  { slug: "mesin", label: "Aneka Mesin Packaging & Prosesing", patterns: /mesin|sperpart|spare ?part|timbangan|^service$|elektronik/i },
  { slug: "baker", label: "Pendukung Baking (Loyang, dll)", patterns: /loyang|cup ?cake|cupcake|spatula|silikon|tatakan|saringan|kitchen|kicthen|mangkok|piring|baking|spuit/i },
  { slug: "bumbu", label: "Bumbu Tabur / Seasoning", patterns: /bumbu|seasoning|tabur|anti tengik|kadar gula|sauce/i },
  { slug: "ompreng", label: "Ompreng Stainless", patterns: /ompreng|5 partisi|stainless/i },
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

/** Semua slug grup (untuk generateStaticParams landing page grup). */
export function allGroupSlugs(): string[] {
  return [...CATEGORY_GROUPS.map((g) => g.slug), OTHER_GROUP.slug];
}

/**
 * Urutan default sebuah grup = posisinya di daftar statis. Dipakai SAMA di
 * beranda & dashboard agar menyimpan satu kartu tidak mengacak urutan lainnya.
 */
export function groupDefaultOrder(slug: string): number {
  const i = allGroupSlugs().indexOf(slug);
  return i === -1 ? 999 : i;
}

export interface GroupSeo {
  title: string;
  description: string;
  h1: string;
  intro: string;
}

/** Konten SEO landing page per grup (judul/deskripsi/H1/intro ber-keyword + lokal). */
export const GROUP_SEO: Record<string, GroupSeo> = {
  mesin: {
    title: "Grosir Mesin Pengemas & Alat Usaha — Bandung & Garut",
    description:
      "Jual mesin pengemas (sealer, cup sealer, filling, mixer), timbangan & alat usaha harga grosir di Akapack Bandung & Garut. Stok nyata, konsultasi via WhatsApp.",
    h1: "Mesin Pengemas & Alat Usaha",
    intro:
      "Akapack menyediakan beragam mesin pengemas dan alat pendukung usaha — mulai dari hand sealer, continuous sealer, cup sealer, mesin filling, hingga mixer dan timbangan digital. Cocok untuk UMKM kuliner, katering, hingga produsen skala kecil yang ingin mengemas produk lebih rapi, cepat, dan higienis. Semua dengan harga grosir dan stok nyata dari dua cabang kami di Bandung (Kiaracondong) dan Garut (Tarogong Kidul). Bingung memilih mesin yang sesuai kapasitas usahamu? Tim kami siap bantu lewat WhatsApp.",
  },
  baking: {
    title: "Grosir Alat Baking & Perlengkapan Dapur — Bandung & Garut",
    description:
      "Loyang, cetakan, spatula, alat baking & perlengkapan dapur harga grosir di Akapack Bandung & Garut. Lengkap untuk bakery, kafe & UMKM kuliner.",
    h1: "Alat Baking & Perlengkapan Dapur",
    intro:
      "Lengkapi dapur dan usaha kue Anda dengan koleksi alat baking Akapack: loyang aneka bentuk, cetakan kue, spatula, alat silikon, saringan, hingga peralatan saji. Pas untuk toko kue, bakery, kafe, katering, maupun pembuat kue rumahan. Tersedia satuan maupun grosir dengan stok nyata dari cabang Bandung dan Garut, plus harga bersaing untuk pembelian banyak.",
  },
  cup: {
    title: "Grosir Cup, Gelas Plastik & Tutup (Lid) — Bandung & Garut",
    description:
      "Cup plastik, gelas, paper cup, sedotan & lid/tutup harga grosir di Akapack Bandung & Garut. Pas untuk kedai minuman, kafe, boba & katering.",
    h1: "Cup, Gelas Plastik & Tutup",
    intro:
      "Butuh kemasan minuman? Akapack menyediakan cup plastik, gelas, paper cup, jelly cup, sedotan, dan tutup (lid) dalam berbagai ukuran. Ideal untuk kedai kopi, gerai boba, jus, kafe, hingga katering yang butuh kemasan minuman rapi dan ekonomis. Harga grosir, stok nyata dua cabang Bandung & Garut, dan bisa pesan cepat via WhatsApp.",
  },
  botol: {
    title: "Grosir Botol, Toples & Jar Plastik — Bandung & Garut",
    description:
      "Botol plastik, toples, jar & tabung kemasan harga grosir di Akapack Bandung & Garut. Untuk minuman, frozen food, kue kering & produk UMKM.",
    h1: "Botol, Toples & Jar",
    intro:
      "Koleksi botol plastik, toples, jar, dan tabung kemasan Akapack cocok untuk minuman kemasan, madu, sambal, kue kering, frozen food, hingga produk kosmetik dan UMKM. Tersedia beragam ukuran dan model dengan harga grosir serta stok nyata dari cabang Bandung dan Garut.",
  },
  box: {
    title: "Grosir Box Makanan, Mika & Tray — Bandung & Garut",
    description:
      "Box makanan, mika, tray, thinwall & dus harga grosir di Akapack Bandung & Garut. Cocok untuk katering, frozen food & online food seller.",
    h1: "Box Makanan, Mika & Tray",
    intro:
      "Kemas makanan dengan rapi dan aman memakai box, mika, tray, thinwall, bento, hingga dus dari Akapack. Pilihan tepat untuk katering, nasi box, frozen food, kue, dan penjual makanan online. Harga grosir untuk pembelian banyak, stok nyata dua cabang Bandung & Garut.",
  },
  plastik: {
    title: "Grosir Plastik & Kantong (Kresek, Wrap) — Bandung & Garut",
    description:
      "Kantong kresek, plastik HD/PE, cling wrap, bubble wrap & sarung tangan harga grosir di Akapack Bandung & Garut. Stok nyata dua cabang.",
    h1: "Plastik & Kantong",
    intro:
      "Kebutuhan plastik usaha lengkap di Akapack: kantong kresek, plastik HD/PE/PP, cling wrap, bubble wrap, sarung tangan plastik, karung, hingga segel. Cocok untuk toko, warung, online seller, dan produsen yang butuh kemasan dan pelindung pengiriman. Harga grosir, stok nyata dari Bandung dan Garut.",
  },
  kertas: {
    title: "Grosir Paper Bag, Kertas Nasi & Kemasan Kertas — Bandung & Garut",
    description:
      "Paper bag, kertas nasi, kraft, amplop, sleeve & cetak kemasan harga grosir di Akapack Bandung & Garut. Untuk bakery, kafe & UMKM kuliner.",
    h1: "Kertas Kemasan & Cetak",
    intro:
      "Akapack menyediakan aneka kemasan berbahan kertas: paper bag, kertas nasi, kraft, amplop, sleeve, hingga layanan cetak kemasan. Ramah untuk brand makanan, bakery, kafe, dan UMKM yang ingin tampil rapi sekaligus eco-friendly. Harga grosir dan stok nyata dari dua cabang Bandung & Garut.",
  },
  pangan: {
    title: "Grosir Bahan Tambahan Pangan & Bumbu Tabur — Bandung & Garut",
    description:
      "Anti tengik (oxygen absorber), bumbu tabur & bahan pendukung pangan harga grosir di Akapack Bandung & Garut. Stok nyata, pesan via WhatsApp.",
    h1: "Bahan & Pendukung Pangan",
    intro:
      "Jaga kualitas dan rasa produk makanan Anda dengan bahan pendukung pangan dari Akapack — seperti anti tengik (oxygen absorber) dan bumbu tabur aneka rasa. Cocok untuk produsen snack, frozen food, dan UMKM kuliner. Harga grosir, stok nyata dua cabang Bandung & Garut.",
  },
  kemasan: {
    title: "Grosir Aneka Kemasan Usaha — Akapack Bandung & Garut",
    description:
      "Beragam kemasan pendukung usaha harga grosir di Akapack Bandung & Garut. Stok nyata dua cabang, harga grosir, pesan cepat via WhatsApp.",
    h1: "Aneka Kemasan",
    intro:
      "Beragam pilihan kemasan untuk kebutuhan usaha Anda, tersedia dengan harga grosir dan stok nyata dari cabang Akapack Bandung dan Garut. Tidak menemukan yang dicari? Hubungi kami via WhatsApp dan tim kami bantu carikan.",
  },
  lainnya: {
    title: "Produk Lainnya — Grosir Kemasan Akapack Bandung & Garut",
    description:
      "Aneka produk pelengkap usaha harga grosir di Akapack Bandung & Garut. Stok nyata dua cabang, pesan cepat via WhatsApp.",
    h1: "Produk Lainnya",
    intro:
      "Berbagai produk pelengkap kebutuhan usaha yang tersedia di Akapack dengan harga grosir dan stok nyata dari cabang Bandung dan Garut. Pesan mudah lewat WhatsApp.",
  },
};

export function groupSeo(slug: string): GroupSeo {
  return (
    GROUP_SEO[slug] ?? {
      title: `${groupLabel(slug)} — Grosir Kemasan Akapack`,
      description: `Grosir ${groupLabel(slug)} di Akapack Bandung & Garut. Harga grosir, stok nyata dua cabang.`,
      h1: groupLabel(slug),
      intro: `Koleksi ${groupLabel(slug)} dengan harga grosir dan stok nyata dari cabang Akapack Bandung & Garut.`,
    }
  );
}
