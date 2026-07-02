import { NextResponse } from "next/server";
import { getSupabase, OUTLETS, TENANT_ID, type OutletKey } from "@/lib/supabase";

export const runtime = "nodejs";

interface IncomingItem {
  id: string;
  qty: number;
}

interface OrderBody {
  items: IncomingItem[];
  customer: {
    name: string;
    phone: string;
    fulfillment: "pickup" | "delivery";
    branch?: OutletKey;
    address?: string;
    payment: "transfer" | "online" | "cod";
    note?: string;
  };
}

function makeOrderNumber(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-6);
  const r = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `WEB-${t}${r}`;
}

export async function POST(req: Request) {
  let body: OrderBody;
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const items = Array.isArray(body.items)
    ? body.items.filter((i) => i && typeof i.id === "string" && i.qty > 0)
    : [];
  const c = body.customer;

  if (items.length === 0) {
    return NextResponse.json({ error: "Keranjang kosong." }, { status: 400 });
  }
  if (!c?.name?.trim() || !c?.phone?.trim()) {
    return NextResponse.json({ error: "Nama & nomor WhatsApp wajib diisi." }, { status: 400 });
  }

  const supabase = getSupabase();
  const ids = [...new Set(items.map((i) => i.id))];

  // Harga OTORITATIF diambil ulang dari DB — harga dari klien diabaikan.
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id,name,sku,unit,price,price_online,is_active")
    .in("id", ids)
    .eq("is_active", true);
  if (pErr) {
    return NextResponse.json({ error: "Gagal memuat data produk." }, { status: 500 });
  }

  const pmap = new Map((products ?? []).map((p) => [p.id, p]));
  const orderId = crypto.randomUUID();
  const orderItems: Record<string, unknown>[] = [];
  let subtotal = 0;

  for (const it of items) {
    const p = pmap.get(it.id);
    if (!p) continue;
    const qty = Math.max(1, Math.floor(it.qty));
    const unitPrice = (p.price_online ?? p.price) as number;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    orderItems.push({
      order_id: orderId,
      product_id: p.id,
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      unit_price: unitPrice,
      qty,
      line_total: lineTotal,
    });
  }

  if (orderItems.length === 0) {
    return NextResponse.json({ error: "Produk tidak lagi tersedia." }, { status: 400 });
  }

  const outletId =
    c.fulfillment === "pickup" && c.branch && OUTLETS[c.branch]
      ? OUTLETS[c.branch]
      : OUTLETS.bandung;
  const orderNumber = makeOrderNumber();

  const { error: oErr } = await supabase.from("orders").insert({
    id: orderId,
    tenant_id: TENANT_ID,
    order_number: orderNumber,
    outlet_id: outletId,
    customer_name: c.name.trim(),
    customer_phone: c.phone.trim(),
    customer_address: c.address?.trim() || null,
    fulfillment: c.fulfillment === "delivery" ? "delivery" : "pickup",
    payment_method: c.payment === "online" ? "midtrans" : "transfer",
    note: c.note?.trim() || null,
    subtotal,
    status: "pending",
    channel: "web",
  });

  if (oErr) {
    const isRls =
      /row-level security|permission|policy|does not exist|relation|could not find the table|schema cache/i.test(
        oErr.message,
      );
    return NextResponse.json(
      {
        error: isRls
          ? "Tabel pesanan belum disiapkan. Jalankan migrasi SQL (supabase/migrations/0001_orders_web.sql) di Supabase."
          : "Gagal menyimpan pesanan.",
        detail: oErr.message,
      },
      { status: 500 },
    );
  }

  const { error: iErr } = await supabase.from("order_items").insert(orderItems);
  if (iErr) {
    return NextResponse.json(
      { error: "Pesanan tersimpan sebagian, mohon hubungi kami via WhatsApp.", detail: iErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, orderNumber, subtotal });
}
