"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth";

const BUCKET = "product-images";
const fail = (m: string) => redirect(`/dashboard/banner?err=${encodeURIComponent(m)}`);

async function authed() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isStaff(user.email)) redirect("/");
  return supabase;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/dashboard/banner");
}

export async function createBanner(formData: FormData) {
  const supabase = await authed();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return fail("Pilih gambar banner dulu.");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const objName = `banner-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(objName, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (upErr) return fail("Upload gagal: " + upErr.message);

  const image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objName}`;
  const { error } = await supabase.from("banners").insert({
    image_url,
    link: String(formData.get("link") || "").trim() || null,
    sort_order: Number(formData.get("sort_order")) || 0,
    is_active: true,
  });
  if (error) return fail("Gagal menyimpan: " + error.message);

  refresh();
  redirect("/dashboard/banner?saved=1");
}

export async function deleteBanner(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await authed();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return fail("Gagal menghapus: " + error.message);
  refresh();
  redirect("/dashboard/banner?saved=1");
}

export async function toggleBanner(formData: FormData) {
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) return;
  const supabase = await authed();
  const { error } = await supabase.from("banners").update({ is_active: !active }).eq("id", id);
  if (error) return fail("Gagal mengubah status: " + error.message);
  refresh();
  redirect("/dashboard/banner?saved=1");
}
