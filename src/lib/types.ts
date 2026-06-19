/**
 * Tipe data publik. CATATAN KEAMANAN: `cost_price` (modal) sengaja TIDAK ada
 * di tipe apa pun yang dikirim ke klien — di-strip di level query (lihat catalog.ts).
 */

/** Tingkat harga grosir. Saat ini `price_tiers` kosong di semua produk,
 * tapi tipe disiapkan agar UI tinggal aktif begitu data terisi. */
export interface PriceTier {
  min_qty: number;
  price: number;
  label?: string;
}

/** Satuan grosir bertingkat (mis. dus berisi N pack). Saat ini `units` kosong. */
export interface ProductUnit {
  name: string;
  qty: number;
  price?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  image_url: string | null;
  price: number;
  price_online: number | null;
  price_market: number | null;
  stock: number;
  unit: string | null;
  units: ProductUnit[];
  price_tiers: PriceTier[];
  has_variants: boolean;
  is_active: boolean;
}

/** Stok agregat per cabang untuk satu produk. */
export interface ProductStock {
  bandung: number;
  garut: number;
  total: number;
}

export interface Outlet {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
}

export interface ProductPage {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
