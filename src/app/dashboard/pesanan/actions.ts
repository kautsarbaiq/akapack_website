"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth";

const ALLOWED = ["pending", "confirmed", "done", "cancelled"];

export async function updateOrderStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !ALLOWED.includes(status)) return;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isStaff(user.email)) redirect("/");

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) redirect(`/dashboard/pesanan/${id}?err=` + encodeURIComponent(error.message));

  revalidatePath(`/dashboard/pesanan/${id}`);
  revalidatePath("/dashboard/pesanan");
  redirect(`/dashboard/pesanan/${id}?saved=1`);
}
