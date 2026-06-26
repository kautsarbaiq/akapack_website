import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { orderStatus } from "@/lib/order-status";

const dt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default async function PesananList() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("orders")
    .select("id,order_number,customer_name,customer_phone,subtotal,status,fulfillment,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const orders = data ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight">Pesanan online</h1>
      <p className="mt-1 font-mono text-xs text-ink-soft">{orders.length} pesanan terbaru</p>

      {orders.length === 0 && (
        <div className="mt-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Belum ada pesanan tampil. Jika seharusnya ada, jalankan migrasi{" "}
          <code className="font-mono">0002_orders_dashboard_rls.sql</code> di Supabase agar karyawan
          bisa membaca pesanan.
        </div>
      )}

      <div className="mt-6 overflow-x-auto border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-3 py-2">No. pesanan</th>
              <th className="px-3 py-2">Pelanggan</th>
              <th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const st = orderStatus(o.status as string);
              return (
                <tr key={o.id as string} className="border-b border-line last:border-0 hover:bg-paper-2">
                  <td className="px-3 py-2">
                    <Link
                      href={`/dashboard/pesanan/${o.id}`}
                      className="font-mono text-xs font-medium text-indigo-ink hover:underline"
                    >
                      {o.order_number as string}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium leading-tight">{o.customer_name as string}</div>
                    <div className="font-mono text-[11px] text-ink-soft">{o.customer_phone as string}</div>
                  </td>
                  <td className="px-3 py-2 text-ink-soft">{dt.format(new Date(o.created_at as string))}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(o.subtotal as number)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={"inline-block border px-2 py-0.5 text-[11px] font-medium " + st.cls}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
