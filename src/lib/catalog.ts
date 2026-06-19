import { getSupabase, OUTLETS } from "./supabase";
import type {
  Category,
  Product,
  ProductPage,
  ProductStock,
} from "./types";

/**
 * Kolom produk yang AMAN dikirim ke publik. `cost_price` sengaja TIDAK ada di sini
 * — ini benteng utama agar modal tidak pernah bocor ke response. Jangan tambahkan.
 */
const PUBLIC_PRODUCT_COLUMNS =
  "id,category_id,name,sku,barcode,description,image_url,price,price_online,price_market,stock,unit,units,price_tiers,has_variants,is_active";

const PAGE_SIZE = 24;
const MAX_RANGE = 1000; // batas baris default Supabase per request

function normalizeProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    units: Array.isArray(row.units) ? (row.units as Product["units"]) : [],
    price_tiers: Array.isArray(row.price_tiers)
      ? (row.price_tiers as Product["price_tiers"])
      : [],
  };
}

export type ProductSort = "name" | "price_asc" | "price_desc";

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string | null;
  search?: string | null;
  sort?: ProductSort;
}

/** Satu halaman produk aktif, dengan filter kategori + pencarian + sort. */
export async function fetchProductsPage(
  query: ProductQuery = {},
): Promise<ProductPage> {
  const {
    page = 1,
    pageSize = PAGE_SIZE,
    categoryId = null,
    search = null,
    sort = "name",
  } = query;

  const supabase = getSupabase();
  let q = supabase
    .from("products")
    .select(PUBLIC_PRODUCT_COLUMNS, { count: "exact" })
    .eq("is_active", true);

  if (categoryId) q = q.eq("category_id", categoryId);
  if (search && search.trim()) {
    const term = search.trim();
    // cari di nama / sku / barcode
    q = q.or(`name.ilike.%${term}%,sku.ilike.%${term}%,barcode.ilike.%${term}%`);
  }

  if (sort === "price_asc") q = q.order("price", { ascending: true });
  else if (sort === "price_desc") q = q.order("price", { ascending: false });
  else q = q.order("name", { ascending: true });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    products: (data ?? []).map(normalizeProduct),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Ambil SEMUA produk aktif dengan paginasi .range() (lewati batas 1000 baris).
 * Dipakai untuk SSG/sitemap/index pencarian — bukan untuk render langsung.
 */
export async function fetchAllActiveProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  const all: Product[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("products")
      .select(PUBLIC_PRODUCT_COLUMNS)
      .eq("is_active", true)
      .order("name", { ascending: true })
      .range(from, from + MAX_RANGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data.map(normalizeProduct));
    if (data.length < MAX_RANGE) break;
    from += MAX_RANGE;
  }
  return all;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_PRODUCT_COLUMNS)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProduct(data) : null;
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,color,icon,sort_order,is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

/** Stok per cabang untuk sekumpulan produk → map productId -> {bandung, garut, total}. */
export async function fetchStockFor(
  productIds: string[],
): Promise<Record<string, ProductStock>> {
  const result: Record<string, ProductStock> = {};
  if (productIds.length === 0) return result;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("inventory")
    .select("product_id,outlet_id,stock")
    .in("product_id", productIds);
  if (error) throw error;

  for (const id of productIds) result[id] = { bandung: 0, garut: 0, total: 0 };
  for (const row of data ?? []) {
    const r = result[row.product_id as string];
    if (!r) continue;
    const stock = (row.stock as number) ?? 0;
    if (row.outlet_id === OUTLETS.bandung) r.bandung = stock;
    else if (row.outlet_id === OUTLETS.garut) r.garut = stock;
    r.total = r.bandung + r.garut;
  }
  return result;
}
