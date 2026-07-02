import "server-only";
import { getSupabaseAdmin } from "./supabase/admin";
import { TENANT_ID } from "./supabase";

/**
 * Jembatan pesanan web → kasir (POS): salin pesanan yang SUDAH DIBAYAR/dikonfirmasi
 * ke tabel `transactions` + `transaction_items` (tabel yang dibaca aplikasi kasir),
 * dengan source='web' agar bisa dibedakan dari penjualan kasir langsung.
 * Idempotent: kalau orders.pos_transaction_id sudah terisi, tidak dobel.
 */
export async function bridgeOrderToPos(
  orderNumber: string,
  opts: { paymentMethod: string; paidAmount?: number } = { paymentMethod: "midtrans" },
): Promise<{ ok: boolean; message: string; txId?: string }> {
  const admin = getSupabaseAdmin();

  const { data: order, error: oErr } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (oErr) return { ok: false, message: "Gagal membaca pesanan: " + oErr.message };
  if (!order) return { ok: false, message: `Pesanan ${orderNumber} tidak ditemukan.` };
  if (order.pos_transaction_id) {
    return { ok: true, message: "Sudah tercatat di kasir.", txId: order.pos_transaction_id as string };
  }

  const { data: items, error: iErr } = await admin
    .from("order_items")
    .select("product_id,name,unit_price,qty,line_total")
    .eq("order_id", order.id);
  if (iErr) return { ok: false, message: "Gagal membaca item: " + iErr.message };
  if (!items || items.length === 0) return { ok: false, message: "Pesanan tanpa item." };

  // cost_price untuk laporan laba POS (kolom ini tak pernah dikirim ke publik).
  const ids = items.map((i) => i.product_id).filter(Boolean);
  const costMap = new Map<string, number>();
  if (ids.length > 0) {
    const { data: costs } = await admin.from("products").select("id,cost_price").in("id", ids);
    for (const c of costs ?? []) costMap.set(c.id as string, (c.cost_price as number) ?? 0);
  }

  const subtotal = Number(order.subtotal) || items.reduce((s, i) => s + (Number(i.line_total) || 0), 0);
  const txId = crypto.randomUUID();

  const { error: tErr } = await admin.from("transactions").insert({
    id: txId,
    tenant_id: order.tenant_id ?? TENANT_ID,
    outlet_id: order.outlet_id,
    transaction_number: order.order_number, // WEB-xxx → mudah dikenali di kasir
    customer_id: null,
    cashier_id: null,
    shift_id: null,
    subtotal,
    discount_amount: 0,
    tax_amount: 0,
    service_charge_amount: 0,
    shipping_cost: 0,
    total: subtotal,
    paid_amount: opts.paidAmount ?? subtotal,
    change_amount: 0,
    payment_method: opts.paymentMethod,
    payment_details: null,
    notes: `Pesanan web ${order.order_number} — ${order.customer_name ?? ""} (${order.customer_phone ?? ""})`,
    status: "completed",
    source: "web",
    created_by: null,
  });
  if (tErr) return { ok: false, message: "Gagal mencatat ke kasir: " + tErr.message };

  const { error: tiErr } = await admin.from("transaction_items").insert(
    items.map((i) => ({
      transaction_id: txId,
      product_id: i.product_id,
      product_name: i.name,
      product_price: i.unit_price,
      quantity: i.qty,
      discount: 0,
      subtotal: i.line_total,
      cost_price: costMap.get(i.product_id as string) ?? 0,
    })),
  );
  if (tiErr) return { ok: false, message: "Transaksi tercatat tapi item gagal: " + tiErr.message, txId };

  await admin.from("orders").update({ pos_transaction_id: txId }).eq("id", order.id);
  return { ok: true, message: "Tercatat di kasir.", txId };
}
