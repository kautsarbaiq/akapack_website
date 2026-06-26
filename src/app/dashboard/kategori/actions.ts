"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { TENANT_ID } from "@/lib/supabase";

const fail = (msg: string) => redirect(`/dashboard/kategori?err=${encodeURIComponent(msg)}`);

async function authed() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

function refresh() {
  revalidatePath("/dashboard/kategori");
  revalidatePath("/produk");
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const supabase = await authed();
  const { error } = await supabase
    .from("categories")
    .insert({ name, tenant_id: TENANT_ID, is_active: true });
  if (error) fail("Gagal menambah kategori: " + error.message);
  refresh();
  redirect("/dashboard/kategori?saved=1");
}

export async function renameCategory(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;
  const supabase = await authed();
  const { error } = await supabase.from("categories").update({ name }).eq("id", id);
  if (error) fail("Gagal mengubah kategori: " + error.message);
  refresh();
  redirect("/dashboard/kategori?saved=1");
}

export async function toggleCategory(formData: FormData) {
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) return;
  const supabase = await authed();
  const { error } = await supabase.from("categories").update({ is_active: !active }).eq("id", id);
  if (error) fail("Gagal mengubah status: " + error.message);
  refresh();
  redirect("/dashboard/kategori?saved=1");
}
