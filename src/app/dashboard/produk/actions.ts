"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { TENANT_ID, OUTLETS } from "@/lib/supabase";

const BUCKET = "product-images";
const fail = (msg: string) => redirect(`/dashboard/produk?err=${encodeURIComponent(msg)}`);

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

/** Update produk yang sudah ada. */
export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) fail("ID produk kosong.");

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const patch: Record<string, unknown> = {
    name: String(formData.get("name") || "").trim(),
    description: (String(formData.get("description") || "").trim() || null) as string | null,
    category_id: (String(formData.get("category_id") || "") || null) as string | null,
    unit: (String(formData.get("unit") || "").trim() || null) as string | null,
    price: Number(formData.get("price")) || 0,
    price_online: formData.get("price_online") ? Number(formData.get("price_online")) : null,
    is_active: formData.get("is_active") === "on",
  };

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(supabase, file, `dash-${id}`);
    if (up.error) fail(up.error);
    patch.image_url = up.url;
  }

  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) fail("Gagal menyimpan: " + error.message);

  revalidatePath(`/produk/${id}`);
  revalidatePath("/dashboard/produk");
  redirect("/dashboard/produk?saved=1");
}

/** Tambah produk baru (insert ke tabel multi-tenant POS). */
export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) fail("Nama produk wajib diisi.");

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    price: Number(formData.get("price")) || 0,
    price_online: formData.get("price_online") ? Number(formData.get("price_online")) : null,
    stock: 0,
    is_active: formData.get("is_active") === "on",
    has_variants: false,
    image_url,
  };

  const { error } = await supabase.from("products").insert(insert);
  if (error) fail("Gagal menambah produk: " + error.message);

  revalidatePath("/produk");
  revalidatePath("/dashboard/produk");
  redirect("/dashboard/produk?saved=1");
}
