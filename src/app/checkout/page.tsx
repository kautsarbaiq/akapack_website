"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/format";
import { SITE, WA_PRIMARY, waLink } from "@/lib/site";
import { cartToWhatsAppText } from "@/lib/wa";

type Fulfillment = "pickup" | "delivery";
type Payment = "online" | "transfer";

interface SuccessData {
  orderNumber: string;
  subtotal: number;
  paid: "paid" | "pending" | "manual";
}

// Snap.js dari Midtrans (dimuat dinamis bila pembayaran online aktif).
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        cb: {
          onSuccess?: (r: unknown) => void;
          onPending?: (r: unknown) => void;
          onError?: (r: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
const MIDTRANS_PROD = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
const ONLINE_ENABLED = Boolean(MIDTRANS_CLIENT_KEY);

export default function CheckoutPage() {
  const { items, subtotal, count, hydrated, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [branch, setBranch] = useState("bandung");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<Payment>(ONLINE_ENABLED ? "online" : "transfer");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  // Muat Snap.js sekali bila online aktif.
  useEffect(() => {
    if (!ONLINE_ENABLED || document.getElementById("midtrans-snap")) return;
    const s = document.createElement("script");
    s.id = "midtrans-snap";
    s.src = (MIDTRANS_PROD ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com") + "/snap/snap.js";
    s.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY!);
    document.body.appendChild(s);
  }, []);

  const customer = {
    name,
    phone,
    fulfillment,
    branch,
    address,
    payment: payment === "online" ? "Bayar online" : "Transfer bank",
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
        return;
      }

      const done = (paid: SuccessData["paid"]) => {
        setSuccess({ orderNumber: data.orderNumber, subtotal: data.subtotal, paid });
        clear();
      };

      if (payment === "online") {
        // Minta token Snap lalu buka popup pembayaran.
        const snapRes = await fetch("/api/payments/snap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber: data.orderNumber }),
        });
        const snapData = await snapRes.json();
        if (!snapRes.ok || !snapData.token || !window.snap) {
          // Pesanan sudah tercatat — fallback ke konfirmasi manual.
          done("manual");
          setError(snapData.error ?? "Pembayaran online sedang gangguan — tim kami akan konfirmasi via WhatsApp.");
          return;
        }
        window.snap.pay(snapData.token, {
          onSuccess: () => done("paid"),
          onPending: () => done("pending"),
          onError: () => {
            done("manual");
          },
          onClose: () => done("pending"),
        });
      } else {
        done("manual");
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
    const isPaid = success.paid === "paid";
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-card">
          <div
            className={
              "mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white " +
              (isPaid ? "bg-success" : "bg-indigo")
            }
          >
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
            {isPaid ? "Pembayaran berhasil!" : "Pesanan diterima"}
          </h1>
          <p className="mt-2 text-ink-soft">Nomor pesanan kamu:</p>
          <div className="mx-auto mt-2 w-fit rounded-lg bg-paper-2 px-4 py-2 font-mono text-lg font-bold">
            {success.orderNumber}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Total <b className="text-ink">{formatRupiah(success.subtotal)}</b>.{" "}
            {isPaid
              ? "Pembayaran sudah kami terima dan pesanan langsung diproses. Tim kami akan menghubungi via WhatsApp untuk pengambilan/pengiriman."
              : success.paid === "pending"
                ? "Selesaikan pembayaran sesuai instruksi. Status akan terupdate otomatis setelah dana masuk."
                : "Tim kami akan menghubungi via WhatsApp untuk konfirmasi stok & pembayaran. Simpan nomor pesanan ini."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/produk"
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-indigo/40 hover:text-indigo-ink"
            >
              Belanja lagi
            </Link>
            <a
              href={waLink(WA_PRIMARY, `Halo Akapack, konfirmasi pesanan ${success.orderNumber}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-success px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
            >
              Konfirmasi via WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Keranjang kosong</h1>
        <Link
          href="/produk"
          className="mt-6 inline-block rounded-full bg-indigo px-7 py-3 text-sm font-bold text-white hover:opacity-90"
        >
          Lihat Katalog
        </Link>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo/60";
  const labelCls = "mb-1.5 block text-xs font-semibold text-ink";
  const radioCard = (on: boolean) =>
    "flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors " +
    (on ? "border-indigo bg-indigo-wash text-indigo-ink" : "border-line bg-card hover:border-indigo/30");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-ink-soft">Lengkapi data di bawah — pesanan langsung masuk ke sistem kami.</p>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="nama">Nama / nama usaha *</label>
              <input id="nama" required value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </div>
            <div>
              <label className={labelCls} htmlFor="wa">Nomor WhatsApp *</label>
              <input id="wa" required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="08xx" />
            </div>
          </div>

          {/* Pengiriman */}
          <fieldset>
            <span className={labelCls}>Pengiriman</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {([["pickup", "Ambil di cabang"], ["delivery", "Kirim ke alamat"]] as const).map(([val, lbl]) => (
                <label key={val} className={radioCard(fulfillment === val)}>
                  <input
                    type="radio"
                    name="fulfillment"
                    checked={fulfillment === val}
                    onChange={() => setFulfillment(val)}
                    className="accent-[#ea580c]"
                  />
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
              <label className={labelCls} htmlFor="alamat">Alamat pengiriman *</label>
              <textarea id="alamat" required value={address} onChange={(e) => setAddress(e.target.value)} className={field} rows={3} />
            </div>
          )}

          {/* Pembayaran */}
          <fieldset>
            <span className={labelCls}>Metode pembayaran</span>
            <div className="grid gap-2">
              {ONLINE_ENABLED && (
                <label className={radioCard(payment === "online")}>
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "online"}
                    onChange={() => setPayment("online")}
                    className="accent-[#ea580c]"
                  />
                  <span>
                    Bayar Online{" "}
                    <span className="ml-1 rounded-md bg-indigo px-1.5 py-0.5 text-[10px] font-bold text-white">OTOMATIS</span>
                    <span className="block text-xs font-normal text-ink-soft">
                      QRIS · Transfer VA semua bank · GoPay/OVO/Dana · Kartu
                    </span>
                  </span>
                </label>
              )}
              <label className={radioCard(payment === "transfer")}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "transfer"}
                  onChange={() => setPayment("transfer")}
                  className="accent-[#ea580c]"
                />
                <span>
                  Transfer bank (manual)
                  <span className="block text-xs font-normal text-ink-soft">
                    Tim kami kirim nomor rekening & konfirmasi via WhatsApp
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <div>
            <label className={labelCls} htmlFor="catatan">Catatan (opsional)</label>
            <textarea id="catatan" value={note} onChange={(e) => setNote(e.target.value)} className={field} rows={2} />
          </div>
        </div>

        {/* Ringkasan */}
        <div className="h-fit rounded-2xl border border-line bg-card p-5 shadow-card lg:sticky lg:top-36">
          <h2 className="text-sm font-bold text-ink">Ringkasan ({count} item)</h2>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 text-sm">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span className="line-clamp-1 text-ink-soft">{it.qty}× {it.name}</span>
                <span className="shrink-0 font-medium">{formatRupiah(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-line pt-4">
            <span className="text-sm text-ink-soft">Total</span>
            <span className="text-2xl font-extrabold tracking-tight text-indigo-ink">{formatRupiah(subtotal)}</span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-discount/30 bg-discount-wash px-3 py-2 text-xs text-discount">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-indigo px-4 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Memproses…" : payment === "online" ? "Bayar Sekarang" : "Kirim Pesanan"}
            </button>
            <a
              href={waLink(WA_PRIMARY, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-success px-4 py-3 text-sm font-bold text-success transition-colors hover:bg-success hover:text-white"
            >
              Pesan via WhatsApp
            </a>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
            {payment === "online"
              ? "Pembayaran diproses aman oleh Midtrans. Pesanan otomatis tercatat setelah dana masuk."
              : "Harga final & ketersediaan stok dikonfirmasi oleh tim sebelum pembayaran."}
          </p>
        </div>
      </form>
    </div>
  );
}
