import { formatRupiah } from "./format";

export interface WaLineItem {
  name: string;
  sku: string | null;
  unit: string | null;
  price: number;
  qty: number;
}

export interface WaCustomer {
  name?: string;
  phone?: string;
  fulfillment?: "pickup" | "delivery";
  branch?: string;
  address?: string;
  payment?: string;
  note?: string;
}

/** Pertanyaan singkat untuk satu produk (tombol "Tanya" di kartu). */
export function productInquiryText(p: { name: string; sku: string | null }): string {
  return `Halo Akapack, saya mau tanya produk: ${p.name}${p.sku ? ` (${p.sku})` : ""}.`;
}

/** Susun isi keranjang jadi pesan WhatsApp terformat. */
export function cartToWhatsAppText(items: WaLineItem[], customer?: WaCustomer): string {
  const lines = items.map((it, idx) => {
    const sku = it.sku ? ` (${it.sku})` : "";
    return `${idx + 1}. ${it.name}${sku}\n   ${it.qty} ${it.unit ?? "pcs"} × ${formatRupiah(it.price)} = ${formatRupiah(it.price * it.qty)}`;
  });
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  let msg = `Halo Akapack, saya mau pesan:\n\n${lines.join("\n")}\n\nSubtotal: ${formatRupiah(subtotal)}`;

  if (customer) {
    const det: string[] = [];
    if (customer.name) det.push(`Nama: ${customer.name}`);
    if (customer.phone) det.push(`No. WA: ${customer.phone}`);
    if (customer.fulfillment)
      det.push(
        customer.fulfillment === "pickup"
          ? `Ambil di cabang: ${customer.branch ?? "-"}`
          : `Kirim ke: ${customer.address ?? "-"}`,
      );
    if (customer.payment) det.push(`Pembayaran: ${customer.payment}`);
    if (customer.note) det.push(`Catatan: ${customer.note}`);
    if (det.length) msg += `\n\n${det.join("\n")}`;
  }
  return msg;
}
