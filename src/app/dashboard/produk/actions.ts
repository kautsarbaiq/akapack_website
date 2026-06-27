"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { TENANT_ID, OUTLETS } from "@/lib/supabase";
import { isStaff } from "@/lib/auth";

const BUCKET = "product-images";
const fail = (msg: string) => redirect(`/dashboard/produk?err=${encodeURIComponent(msg)}`);

/** Pastikan pemanggil adalah karyawan (defense-in-depth, tak hanya andalkan proxy). */
async function requireStaff(supabase: Awaited<ReturnType<typeof createSupabaseServer>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isStaff(user.email)) redirect("/");
  return user;
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  file: File,
  prefix: string,
): Promise<{ url: string | null; error: string | null }> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const objName = `${prefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objName, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (error) return { url: null, error: "Upload foto gagal: " + error.message };
  return {
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objName}`,
    error: null,
  };
}

/** Set stok satu produk di satu cabang (update jika ada, insert jika belum). */
async function setStock(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  productId: string,
  outletId: string,
  stock: number,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("inventory")
    .select("id")
    .eq("product_id", productId)
    .eq("outlet_id", outletId)
    .maybeSingle();
  if (existing?.id) {
    const { error } = await supabase.from("inventory").update({ stock }).eq("id", existing.id);
    return error ? error.message : null;
  }
  const { error } = await supabase
    .from("inventory")
    .insert({ product_id: productId, outlet_id: outletId, stock, tenant_id: TENANT_ID });
  return error ? error.message : null;
}

function num(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

/** Harga dari form: null bila kosong/tidak valid (bukan diam-diam jadi 0). */
function parsePrice(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function revalidateCatalog(id?: string) {
  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/dashboard/produk");
  if (id) revalidatePath(`/produk/${id}`);
}

/** Update produk yang sudah ada. */
export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) fail("ID produk kosong.");

  const supabase = await createSupabaseServer();
  await requireStaff(supabase);

  const price = parsePrice(formData.get("price"));
  if (price === null) fail("Harga wajib diisi dan harus angka ≥ 0.");
  const priceOnline = parsePrice(formData.get("price_online"));

  const patch: Record<string, unknown> = {
    name: String(formData.get("name") || "").trim(),
    description: (String(formData.get("description") || "").trim() || null) as string | null,
    category_id: (String(formData.get("category_id") || "") || null) as string | null,
    unit: (String(formData.get("unit") || "").trim() || null) as string | null,
    price,
    price_online: priceOnline && priceOnline > 0 ? priceOnline : null,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  };

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(supabase, file, `dash-${id}`);
    if (up.error) fail(up.error);
    patch.image_url = up.url;
  }

  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) fail("Gagal menyimpan: " + error.message);

  if (formData.has("stock_bandung")) {
    const e = await setStock(supabase, id, OUTLETS.bandung, num(formData.get("stock_bandung")));
    if (e) fail("Gagal simpan stok Bandung: " + e);
  }
  if (formData.has("stock_garut")) {
    const e = await setStock(supabase, id, OUTLETS.garut, num(formData.get("stock_garut")));
    if (e) fail("Gagal simpan stok Garut: " + e);
  }

  revalidateCatalog(id);
  redirect("/dashboard/produk?saved=1");
}

/** Tambah produk baru (insert ke tabel multi-tenant POS). */
export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) fail("Nama produk wajib diisi.");

  const supabase = await createSupabaseServer();
  const user = await requireStaff(supabase);

  const price = parsePrice(formData.get("price"));
  if (price === null) fail("Harga wajib diisi dan harus angka ≥ 0.");
  const priceOnline = parsePrice(formData.get("price_online"));

  let image_url: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(supabase, file, "dash-new");
    if (up.error) fail(up.error);
    image_url = up.url;
  }

  const sku =
    "WEB-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase();

  const insert = {
    tenant_id: TENANT_ID,
    outlet_id: OUTLETS.bandung,
    created_by: user.id,
    name,
    sku,
    description: String(formData.get("description") || "").trim() || null,
    category_id: String(formData.get("category_id") || "") || null,
    unit: String(formData.get("unit") || "").trim() || null,
    price,
    price_online: priceOnline && priceOnline > 0 ? priceOnline : null,
    stock: 0,
    is_active: formData.get("is_active") === "on",
    has_variants: false,
    image_url,
  };

  const { data: created, error } = await supabase
    .from("products")
    .insert(insert)
    .select("id")
    .single();
  if (error) fail("Gagal menambah produk: " + error.message);

  const newId = created?.id as string | undefined;
  if (newId) {
    if (formData.has("stock_bandung")) {
      const e = await setStock(supabase, newId, OUTLETS.bandung, num(formData.get("stock_bandung")));
      if (e) fail("Produk dibuat, tapi stok Bandung gagal: " + e);
    }
    if (formData.has("stock_garut")) {
      const e = await setStock(supabase, newId, OUTLETS.garut, num(formData.get("stock_garut")));
      if (e) fail("Produk dibuat, tapi stok Garut gagal: " + e);
    }
  }

  revalidateCatalog();
  redirect("/dashboard/produk?saved=1");
}
