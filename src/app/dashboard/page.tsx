import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function DashboardHome() {
  const supabase = await createSupabaseServer();

  async function n(q: PromiseLike<{ count: number | null }>): Promise<number | null> {
    try {
      const r = await q;
      return r.count ?? 0;
    } catch {
      return null;
    }
  }
  const P = () => supabase.from("products").select("id", { count: "exact", head: true });

  const aktif = await n(P().eq("is_active", true));
  const tanpaFoto = await n(P().eq("is_active", true).is("image_url", null));
  const hargaKosong = await n(P().eq("is_active", true).or("price.is.null,price.eq.0"));
  const nonaktif = await n(P().eq("is_active", false));
  const pesananBaru = await n(
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  );

  const fmt = new Intl.NumberFormat("id-ID");
  const val = (n: number | null) => (n == null ? "–" : fmt.format(n));

  const cards: {
    label: string;
    value: number | null;
    href: string;
    warn?: boolean;
    accent?: boolean;
  }[] = [
    { label: "Produk aktif", value: aktif, href: "/dashboard/produk?status=aktif" },
    { label: "Belum ada foto", value: tanpaFoto, href: "/dashboard/produk?foto=tanpa", warn: (tanpaFoto ?? 0) > 0 },
    { label: "Harga belum diisi", value: hargaKosong, href: "/dashboard/produk?harga=kosong", warn: (hargaKosong ?? 0) > 0 },
    { label: "Nonaktif", value: nonaktif, href: "/dashboard/produk?status=nonaktif" },
    { label: "Pesanan baru", value: pesananBaru, href: "/dashboard/pesanan", accent: (pesananBaru ?? 0) > 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight">Ringkasan</h1>
      <p className="mt-2 text-ink-soft">Pantau & lengkapi katalog. Klik kartu untuk membuka daftarnya.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={
              "flex flex-col justify-between border p-5 transition-colors " +
              (c.accent
                ? "border-indigo bg-indigo text-white hover:opacity-90"
                : c.warn
                  ? "border-amber-300 bg-amber-50 hover:border-amber-400"
                  : "border-line bg-card hover:border-ink/25")
            }
          >
            <div
              className={
                "font-mono text-xs uppercase tracking-[0.1em] " +
                (c.accent ? "text-white/80" : "text-ink-soft")
              }
            >
              {c.label}
            </div>
            <div className="mt-3 font-display text-3xl font-medium">{val(c.value)}</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
        Aksi cepat
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["+ Tambah produk", "/dashboard/produk/baru"],
          ["Kelola produk", "/dashboard/produk"],
          ["Kelola kategori", "/dashboard/kategori"],
          ["Kartu beranda", "/dashboard/grup"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="border border-line bg-card p-4 font-medium transition-colors hover:border-ink/25 hover:bg-paper-2"
          >
            {label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
