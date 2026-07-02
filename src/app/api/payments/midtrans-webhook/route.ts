import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isPaidStatus, midtransEnabled, verifySignature } from "@/lib/midtrans";
import { bridgeOrderToPos } from "@/lib/pos-bridge";

export const runtime = "nodejs";

/**
 * Webhook notifikasi Midtrans. Set URL ini di Dashboard Midtrans →
 * Settings → Configuration → Payment Notification URL:
 *   https://www.akapack.com/api/payments/midtrans-webhook
 * Saat settlement: tandai pesanan LUNAS + catat otomatis ke kasir (POS).
 */
export async function POST(req: Request) {
  if (!midtransEnabled()) return NextResponse.json({ ok: true }); // abaikan bila nonaktif

  let n: Record<string, string>;
  try {
    n = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const orderId = n.order_id ?? "";
  if (
    !orderId ||
    !verifySignature({
      order_id: orderId,
      status_code: n.status_code ?? "",
      gross_amount: n.gross_amount ?? "",
      signature_key: n.signature_key ?? "",
    })
  ) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  const status = n.transaction_status ?? "";
  const admin = getSupabaseAdmin();

  if (isPaidStatus(status, n.fraud_status)) {
    // LUNAS → tandai paid + jembatani ke kasir (idempotent).
    const { data: order } = await admin
      .from("orders")
      .select("id,payment_status,status")
      .eq("order_number", orderId)
      .maybeSingle();
    if (!order) return NextResponse.json({ ok: true }); // bukan pesanan kita

    if (order.payment_status !== "paid") {
      await admin
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          paid_via: "midtrans",
          payment_detail: n.payment_type ?? null,
          status: order.status === "pending" ? "confirmed" : order.status,
        })
        .eq("id", order.id);
    }

    const bridge = await bridgeOrderToPos(orderId, {
      paymentMethod: "midtrans_" + (n.payment_type ?? "online"),
      paidAmount: Number(n.gross_amount) || undefined,
    });
    // Jangan gagalkan webhook bila bridge gagal — pembayaran tetap tercatat.
    return NextResponse.json({ ok: true, bridged: bridge.ok, message: bridge.message });
  }

  if (status === "expire" || status === "cancel" || status === "deny") {
    await admin
      .from("orders")
      .update({ payment_status: status === "expire" ? "expired" : "failed" })
      .eq("order_number", orderId)
      .neq("payment_status", "paid");
  }
  // pending → biarkan unpaid.
  return NextResponse.json({ ok: true });
}
