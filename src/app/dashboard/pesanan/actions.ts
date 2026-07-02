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

/**
 * Catat pesanan ke kasir (POS): salin ke tabel transactions agar muncul di
 * aplikasi kasir. Untuk pembayaran online ini otomatis via webhook; tombol ini
 * untuk pesanan transfer manual yang sudah dibayar pelanggan.
 */
export async function recordToPos(formData: FormData) {
  const id = String(formData.get("id") || "");
  const orderNumber = String(formData.get("order_number") || "");
  if (!id || !orderNumber) return;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isStaff(user.email)) redirect("/");

  const { bridgeOrderToPos } = await import("@/lib/pos-bridge");
  const res = await bridgeOrderToPos(orderNumber, { paymentMethod: "transfer" });
  if (!res.ok) redirect(`/dashboard/pesanan/${id}?err=` + encodeURIComponent(res.message));

  // Tandai lunas manual bila belum.
  await supabase
    .from("orders")
    .update({ payment_status: "paid", paid_via: "manual", paid_at: new Date().toISOString() })
    .eq("id", id)
    .neq("payment_status", "paid");

  revalidatePath(`/dashboard/pesanan/${id}`);
  revalidatePath("/dashboard/pesanan");
  redirect(`/dashboard/pesanan/${id}?saved=1`);
}
