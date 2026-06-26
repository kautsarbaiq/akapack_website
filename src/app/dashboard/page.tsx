import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function DashboardHome() {
  const supabase = await createSupabaseServer();
  let total: number | null = null;
  let withImg: number | null = null;
  try {
    const a = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    total = a.count ?? null;
    const b = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .not("image_url", "is", null);
    withImg = b.count ?? null;
  } catch {
    /* abaikan; tampilkan "–" */
  }
  const fmt = new Intl.NumberFormat("id-ID");

  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight">Ringkasan</h1>
      <p className="mt-2 text-ink-soft">Kelola katalog produk Akapack dari sini.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-line bg-card p-5">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Produk aktif</div>
          <div className="mt-2 font-display text-3xl font-medium">
            {total == null ? "–" : fmt.format(total)}
          </div>
        </div>
        <div className="border border-line bg-card p-5">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Sudah berfoto</div>
          <div className="mt-2 font-display text-3xl font-medium">
            {withImg == null ? "–" : fmt.format(withImg)}
          </div>
        </div>
        <Link
          href="/dashboard/produk/baru"
          className="flex flex-col justify-between border border-line bg-indigo p-5 text-white transition-opacity hover:opacity-90"
        >
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-white/80">Aksi</div>
          <div className="mt-2 font-display text-xl font-medium">+ Tambah produk</div>
        </Link>
        <Link
          href="/dashboard/produk"
          className="flex flex-col justify-between border border-ink bg-card p-5 transition-colors hover:bg-paper-2"
        >
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Aksi</div>
          <div className="mt-2 font-display text-xl font-medium">Kelola produk →</div>
        </Link>
      </div>
    </div>
  );
}
