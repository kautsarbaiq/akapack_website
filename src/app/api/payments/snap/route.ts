import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSnapTransaction, midtransEnabled } from "@/lib/midtrans";

export const runtime = "nodejs";

/** Buat token Midtrans Snap untuk pesanan yang baru dibuat. */
export async function POST(req: Request) {
  if (!midtransEnabled()) {
    return NextResponse.json({ error: "Pembayaran online belum aktif." }, { status: 503 });
  }

  let body: { orderNumber?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
  const orderNumber = body.orderNumber?.trim();
  if (!orderNumber || !/^WEB-[A-Z0-9]+$/.test(orderNumber)) {
    return NextResponse.json({ error: "Nomor pesanan tidak valid." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: order, error } = await admin
    .from("orders")
    .select("id,order_number,subtotal,customer_name,customer_phone,payment_status")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error || !order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (order.payment_status === "paid") {
    return NextResponse.json({ error: "Pesanan sudah dibayar." }, { status: 409 });
  }

  const { data: items } = await admin
    .from("order_items")
    .select("product_id,name,unit_price,qty")
    .eq("order_id", order.id);

  try {
    const snap = await createSnapTransaction({
      orderId: order.order_number as string,
      grossAmount: Number(order.subtotal) || 0,
      customerName: (order.customer_name as string) ?? "Pelanggan",
      customerPhone: (order.customer_phone as string) ?? "",
      items: (items ?? []).map((i) => ({
        id: (i.product_id as string) ?? "item",
        price: Number(i.unit_price) || 0,
        quantity: Number(i.qty) || 1,
        name: (i.name as string) ?? "Produk",
      })),
    });
    return NextResponse.json({ token: snap.token, redirect_url: snap.redirect_url });
  } catch (e) {
    return NextResponse.json(
      { error: "Gagal membuat sesi pembayaran.", detail: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
