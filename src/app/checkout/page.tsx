"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { SITE, WA_PRIMARY, waLink } from "@/lib/site";
import { cartToWhatsAppText } from "@/lib/wa";

type Fulfillment = "pickup" | "delivery";
type Payment = "transfer" | "cod";

interface SuccessData {
  orderNumber: string;
  subtotal: number;
}

export default function CheckoutPage() {
  const { items, subtotal, count, hydrated, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [branch, setBranch] = useState("bandung");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<Payment>("transfer");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const customer = {
    name,
    phone,
    fulfillment,
    branch,
    address,
    payment: payment === "cod" ? "COD" : "Transfer bank",
    note,
  };
  const waText = cartToWhatsAppText(
    items.map((i) => ({ name: i.name, sku: i.sku, unit: i.unit, price: i.price, qty: i.qty })),
    customer,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          customer: { name, phone, fulfillment, branch, address, payment, note },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memproses pesanan.");
      } else {
        setSuccess({ orderNumber: data.orderNumber, subtotal: data.subtotal });
        clear();
      }
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lewat WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-ink-soft sm:px-6">Memuat…</div>;
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-indigo bg-indigo-wash text-2xl text-indigo-ink">
          ✓
        </div>
        <h1 className="mt-5 font-display text-3xl font-medium">Pesanan diterima</h1>
        <p className="mt-3 text-ink-soft">
          Nomor pesanan kamu:
          <span className="mt-1 block font-mono text-xl font-medium text-ink">
            {success.orderNumber}
          </span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Total {formatRupiah(success.subtotal)}. Tim kami akan menghubungi via WhatsApp untuk
          konfirmasi stok & pembayaran. Simpan nomor pesanan ini.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/produk" className="border border-ink px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-paper">
            Belanja lagi
          </Link>
          <a
            href={waLink(WA_PRIMARY, `Halo Akapack, konfirmasi pesanan ${success.orderNumber}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Konfirmasi via WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-medium">Keranjang kosong</h1>
        <Link href="/produk" className="mt-6 inline-block bg-indigo px-6 py-3 text-sm font-medium text-white hover:opacity-90">
          Lihat katalog
        </Link>
      </div>
    );
  }

  const field = "w-full border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-ink/40";
  const labelCls = "mb-1.5 block font-mono text-xs uppercase tracking-[0.08em] text-ink-soft";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft">Checkout</div>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">Data pemesanan</h1>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="nama">Nama / nama usaha</label>
              <input id="nama" required value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </div>
            <div>
              <label className={labelCls} htmlFor="wa">Nomor WhatsApp</label>
              <input id="wa" required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="08xx" />
            </div>
          </div>

          {/* Pengambilan */}
          <fieldset>
            <span className={labelCls}>Pengiriman</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {([["pickup", "Ambil di cabang"], ["delivery", "Kirim ke alamat"]] as const).map(([val, lbl]) => (
                <label
                  key={val}
                  className={
                    "flex cursor-pointer items-center gap-2 border px-3 py-2.5 text-sm " +
                    (fulfillment === val ? "border-ink bg-paper-2" : "border-line bg-card")
                  }
                >
                  <input type="radio" name="fulfillment" checked={fulfillment === val} onChange={() => setFulfillment(val)} />
                  {lbl}
                </label>
              ))}
            </div>
          </fieldset>

          {fulfillment === "pickup" ? (
            <div>
              <label className={labelCls} htmlFor="cabang">Cabang pengambilan</label>
              <select id="cabang" value={branch} onChange={(e) => setBranch(e.target.value)} className={field}>
                {SITE.outlets.map((o) => (
                  <option key={o.key} value={o.key}>{o.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={labelCls} htmlFor="alamat">Alamat pengiriman</label>
              <textarea id="alamat" required value={address} onChange={(e) => setAddress(e.target.value)} className={field} rows={3} />
            </div>
          )}

          {/* Pembayaran */}
          <fieldset>
            <span className={labelCls}>Metode pembayaran</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {([["transfer", "Transfer bank"], ["cod", "COD / bayar di tempat"]] as const).map(([val, lbl]) => (
                <label
                  key={val}
                  className={
                    "flex cursor-pointer items-center gap-2 border px-3 py-2.5 text-sm " +
                    (payment === val ? "border-ink bg-paper-2" : "border-line bg-card")
                  }
                >
                  <input type="radio" name="payment" checked={payment === val} onChange={() => setPayment(val)} />
                  {lbl}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className={labelCls} htmlFor="catatan">Catatan (opsional)</label>
            <textarea id="catatan" value={note} onChange={(e) => setNote(e.target.value)} className={field} rows={2} />
          </div>
        </div>

        {/* Ringkasan */}
        <div className="h-fit border border-line bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Ringkasan ({count})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span className="line-clamp-1 text-ink-soft">{it.qty}× {it.name}</span>
                <span className="shrink-0">{formatRupiah(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-ink-soft">Subtotal</span>
            <span className="font-display text-2xl font-medium">{formatRupiah(subtotal)}</span>
          </div>

          {error && (
            <p className="mt-4 border border-line bg-paper-2 px-3 py-2 text-xs text-ink">{error}</p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Memproses…" : "Kirim pesanan"}
            </button>
            <a
              href={waLink(WA_PRIMARY, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 border border-ink px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Pesan via WhatsApp
            </a>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
            Harga final & ketersediaan stok dikonfirmasi oleh tim sebelum pembayaran.
          </p>
        </div>
      </form>
    </div>
  );
}
