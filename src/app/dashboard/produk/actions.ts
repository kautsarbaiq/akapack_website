"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

const BUCKET = "product-images";

/** Update produk yang sudah ada (nama, deskripsi, harga, kategori, status, foto). */
export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("ID produk kosong.");

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
    price_online: formData.get("price_online")
      ? Number(formData.get("price_online"))
      : null,
    is_active: formData.get("is_active") === "on",
  };

  // Foto opsional
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const objName = `dash-${id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(objName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (upErr) throw new Error("Gagal upload foto: " + upErr.message);
    patch.image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objName}`;
  }

  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw new Error("Gagal menyimpan: " + error.message);

  revalidatePath(`/produk/${id}`);
  revalidatePath("/dashboard/produk");
  redirect("/dashboard/produk?saved=1");
}
