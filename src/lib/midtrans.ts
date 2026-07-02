import "server-only";
import { createHash } from "node:crypto";

/**
 * Integrasi Midtrans Snap (pembayaran online: QRIS, VA, e-wallet, kartu).
 * Aktif hanya bila env MIDTRANS_SERVER_KEY terisi. Sandbox vs produksi
 * ditentukan MIDTRANS_IS_PRODUCTION=true.
 */
export function midtransEnabled(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

function apiBase(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

function authHeader(): string {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

export interface SnapItem {
  id: string;
  price: number;
  quantity: number;
  name: string; // maks 50 char (aturan Midtrans)
}

/** Buat transaksi Snap → kembalikan token untuk window.snap.pay(). */
export async function createSnapTransaction(params: {
  orderId: string; // dipakai sebagai order_id Midtrans (nomor pesanan WEB-xxx)
  grossAmount: number;
  customerName: string;
  customerPhone: string;
  items: SnapItem[];
}): Promise<{ token: string; redirect_url: string }> {
  const res = await fetch(`${apiBase()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.grossAmount),
      },
      item_details: params.items.map((i) => ({
        id: i.id,
        price: Math.round(i.price),
        quantity: i.quantity,
        name: i.name.slice(0, 50),
      })),
      customer_details: {
        first_name: params.customerName.slice(0, 50),
        phone: params.customerPhone,
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Midtrans ${res.status}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as { token: string; redirect_url: string };
}

/**
 * Verifikasi notifikasi webhook Midtrans:
 * signature_key = sha512(order_id + status_code + gross_amount + server_key)
 */
export function verifySignature(n: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const key = process.env.MIDTRANS_SERVER_KEY ?? "";
  const expected = createHash("sha512")
    .update(n.order_id + n.status_code + n.gross_amount + key)
    .digest("hex");
  return expected === n.signature_key;
}

/** Status Midtrans → sudah dibayar? (settlement/capture = dana masuk) */
export function isPaidStatus(transactionStatus: string, fraudStatus?: string): boolean {
  if (transactionStatus === "settlement") return true;
  if (transactionStatus === "capture") return fraudStatus === "accept" || !fraudStatus;
  return false;
}
