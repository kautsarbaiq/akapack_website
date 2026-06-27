"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth";

const BUCKET = "product-images";
const fail = (m: string) => redirect(`/dashboard/grup?err=${encodeURIComponent(m)}`);

async function authed() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isStaff(user.email)) redirect("/");
  return supabase;
}

export async function saveGroup(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  if (!slug) fail("Slug kosong.");
  const supabase = await authed();

  const row: Record<string, unknown> = {
    slug,
    label: String(formData.get("label") || "").trim() || null,
    sort_order: Number(formData.get("sort_order")) || 0,
    is_active: formData.get("is_active") === "on",
  };

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const objName = `grup-${slug}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(objName, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (upErr) fail("Upload foto gagal: " + upErr.message);
    row.image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objName}`;
  }

  const { error } = await supabase.from("group_settings").upsert(row, { onConflict: "slug" });
  if (error) fail("Gagal menyimpan: " + error.message);

  revalidatePath("/");
  revalidatePath("/dashboard/grup");
  redirect("/dashboard/grup?saved=1");
}

export async function clearGroupImage(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  if (!slug) return;
  const supabase = await authed();
  const { error } = await supabase
    .from("group_settings")
    .upsert({ slug, image_url: null }, { onConflict: "slug" });
  if (error) fail("Gagal menghapus foto: " + error.message);
  revalidatePath("/");
  revalidatePath("/dashboard/grup");
  redirect("/dashboard/grup?saved=1");
}
