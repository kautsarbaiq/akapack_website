import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { orderStatus, ORDER_STATUS } from "@/lib/order-status";
import { updateOrderStatus, recordToPos } from "../actions";

const dt = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" });

function waHref(phone: string) {
  let d = (phone || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return `https://wa.me/${d}`;
}

export default async function PesananDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createSupabaseServer();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: itemsData } = await supabase
    .from("order_items")
    .select("name,sku,unit,unit_price,qty,line_total")
    .eq("order_id", id);
  const items = itemsData ?? [];
  const st = orderStatus(order.status as string);

  return (
    <div className="max-w-4xl">
      <nav className="font-mono text-xs text-ink-soft">
        <Link href="/dashboard/pesanan" className="hover:text-ink">← Pesanan</Link>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-medium tracking-tight">
          {order.order_number as string}
        </h1>
        <span className={"inline-block border px-2 py-0.5 text-xs font-medium " + st.cls}>
          {st.label}
        </span>
        {order.payment_status === "paid" ? (
          <span className="inline-block border border-green-300 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
            ✓ Lunas{order.paid_via === "midtrans" ? " (online)" : ""}
          </span>
        ) : (
          <span className="inline-block border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
            Belum dibayar
          </span>
        )}
        {order.pos_transaction_id ? (
          <span className="inline-block border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
            ✓ Tercatat di kasir
          </span>
        ) : null}
      </div>
      <p className="mt-1 font-mono text-xs text-ink-soft">
        {dt.format(new Date(order.created_at as string))}
      </p>

      {sp.saved && (
        <div className="mt-4 border border-green-600/40 bg-green-50 px-4 py-2 text-sm text-green-800">
          Status diperbarui.
        </div>
      )}
      {sp.err && (
        <div className="mt-4 border border-red-600/40 bg-red-50 px-4 py-2 text-sm text-red-700">
          {sp.err}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Pelanggan */}
        <div className="border border-line bg-card p-5 text-sm">
          <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Pelanggan</h2>
          <div className="mt-2 font-medium">{order.customer_name as string}</div>
          <div className="mt-1 flex gap-3">
            <a href={`tel:${order.customer_phone}`} className="text-indigo-ink hover:underline">
              {order.customer_phone as string}
            </a>
            <a
              href={waHref(order.customer_phone as string)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-ink hover:underline"
            >
              WhatsApp
            </a>
          </div>
          <dl className="mt-3 space-y-1 text-ink-soft">
            <div>Pengiriman: <span className="text-ink">{order.fulfillment === "delivery" ? "Dikirim" : "Ambil di toko"}</span></div>
            <div>
              Pembayaran:{" "}
              <span className="text-ink">
                {order.payment_method === "midtrans" ? "Online (Midtrans)" : "Transfer"}
                {order.payment_detail ? ` · ${order.payment_detail}` : ""}
              </span>
            </div>
            {order.customer_address ? <div>Alamat: <span className="text-ink">{order.customer_address as string}</span></div> : null}
            {order.note ? <div>Catatan: <span className="text-ink">{order.note as string}</span></div> : null}
          </dl>
        </div>

        {/* Ubah status */}
        <div className="border border-line bg-card p-5">
          <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Ubah status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(ORDER_STATUS).map(([value, meta]) => (
              <form action={updateOrderStatus} key={value}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="status" value={value} />
                <button
                  disabled={order.status === value}
                  className={
                    "border px-3 py-2 text-xs font-medium disabled:opacity-40 " +
                    (order.status === value ? meta.cls : "border-line hover:border-ink/40")
                  }
                >
                  {meta.label}
                </button>
              </form>
            ))}
          </div>

          {/* Jembatan ke kasir (POS) */}
          {!order.pos_transaction_id && (
            <div className="mt-4 border-t border-line pt-4">
              <form action={recordToPos}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="order_number" value={order.order_number as string} />
                <button className="bg-ink px-4 py-2 text-xs font-medium text-white hover:opacity-90">
                  ⚡ Catat ke Kasir (POS)
                </button>
              </form>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                Salin pesanan ini ke sistem kasir sebagai penjualan (source: web) & tandai lunas.
                Pembayaran online tercatat otomatis — tombol ini untuk transfer manual.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Item */}
      <div className="mt-6 overflow-x-auto border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-3 py-2">Produk</th>
              <th className="px-3 py-2 text-center">Qty</th>
              <th className="px-3 py-2 text-right">Harga</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{it.name as string}</div>
                  <div className="font-mono text-[11px] text-ink-soft">{(it.sku as string) || ""}</div>
                </td>
                <td className="px-3 py-2 text-center">
                  {it.qty as number} {(it.unit as string) || ""}
                </td>
                <td className="px-3 py-2 text-right">{formatRupiah(it.unit_price as number)}</td>
                <td className="px-3 py-2 text-right">{formatRupiah(it.line_total as number)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line font-medium">
              <td colSpan={3} className="px-3 py-2 text-right">Total</td>
              <td className="px-3 py-2 text-right">{formatRupiah(order.subtotal as number)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
