import { createSupabaseServer } from "@/lib/supabase/server";
import { createBanner, deleteBanner, toggleBanner } from "./actions";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";

export default async function BannerPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("banners")
    .select("id,image_url,link,sort_order,is_active")
    .order("sort_order", { ascending: true });
  const banners = data ?? [];

  const input = "mt-1 w-full border border-line bg-card px-3 py-2 text-sm outline-none focus:border-ink";
  const label = "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-medium tracking-tight">Banner beranda</h1>
      <p className="mt-1 text-ink-soft">
        Poster yang tampil besar di atas beranda (geser & auto-scroll). Ukuran disarankan{" "}
        <strong>1600×640px (rasio 5:2)</strong> supaya pas tanpa terpotong. Urutan kecil tampil duluan.
      </p>

      {sp.saved && (
        <div className="mt-4 border border-green-600/40 bg-green-50 px-4 py-2 text-sm text-green-800">
          Tersimpan.
        </div>
      )}
      {sp.err && (
        <div className="mt-4 border border-red-600/40 bg-red-50 px-4 py-2 text-sm text-red-700">
          {sp.err}
        </div>
      )}

      {/* Tambah banner */}
      <form action={createBanner} className="mt-6 border border-line bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_80px]">
          <div>
            <label className={label}>Gambar poster *</label>
            <input name="image" type="file" accept="image/*" required className="mt-1 block text-sm" />
          </div>
          <div>
            <label className={label}>Link (opsional)</label>
            <input name="link" placeholder="/produk/grup/cup" className={input} />
          </div>
          <div>
            <label className={label}>Urutan</label>
            <input name="sort_order" type="number" defaultValue={banners.length + 1} className={input} />
          </div>
        </div>
        <button className="mt-4 bg-indigo px-5 py-2 text-sm font-medium text-white hover:opacity-90">
          + Tambah banner
        </button>
      </form>

      {/* Daftar banner */}
      <div className="mt-6 space-y-3">
        {banners.length === 0 ? (
          <div className="border border-dashed border-line py-12 text-center text-ink-soft">
            Belum ada banner. Tambahkan poster di atas — sementara beranda memakai banner default.
          </div>
        ) : (
          banners.map((b) => {
            const id = b.id as string;
            const active = b.is_active as boolean;
            return (
              <div key={id} className="flex flex-wrap items-center gap-4 border border-line bg-card p-3">
                <span className="h-16 w-32 shrink-0 overflow-hidden border border-line bg-paper-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image_url as string} alt="" className="h-full w-full object-cover" />
                </span>
                <div className="min-w-[120px] flex-1 text-sm">
                  <div className="font-mono text-xs text-ink-soft">Urutan {b.sort_order as number}</div>
                  {b.link ? <div className="text-ink-soft">→ {b.link as string}</div> : null}
                </div>
                <form action={toggleBanner}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="active" value={String(active)} />
                  <button
                    className={
                      "w-24 border px-3 py-2 text-xs font-medium " +
                      (active ? "border-green-600/40 text-green-700" : "border-line text-ink-soft")
                    }
                  >
                    {active ? "● Tampil" : "○ Sembunyi"}
                  </button>
                </form>
                <form action={deleteBanner}>
                  <input type="hidden" name="id" value={id} />
                  <ConfirmButton
                    message="Hapus banner ini?"
                    className="border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </ConfirmButton>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
