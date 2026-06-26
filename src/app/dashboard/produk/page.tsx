import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatRupiah, titleCase, displayPrice } from "@/lib/format";

const PAGE = 20;

interface SP {
  q?: string;
  hal?: string;
  saved?: string;
  err?: string;
}

export default async function DashboardProdukList({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number.parseInt(sp.hal ?? "1", 10) || 1);

  const supabase = await createSupabaseServer();
  let query = supabase
    .from("products")
    .select("id,name,sku,price,price_online,image_url,category_id,is_active", { count: "exact" })
    .order("updated_at", { ascending: false });
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  const from = (page - 1) * PAGE;
  const { data, count } = await query.range(from, from + PAGE - 1);
  const cats = await supabase.from("categories").select("id,name");
  const catMap = new Map((cats.data ?? []).map((c) => [c.id as string, c.name as string]));

  const rows = data ?? [];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE));

  const linkTo = (p: number) =>
    `/dashboard/produk?${new URLSearchParams({ ...(q ? { q } : {}), hal: String(p) })}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">Produk</h1>
          <p className="mt-1 font-mono text-xs text-ink-soft">{total} produk</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama / SKU…"
              className="border border-line bg-card px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button className="border border-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-paper">
              Cari
            </button>
          </form>
          <Link
            href="/dashboard/produk/baru"
            className="bg-indigo px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Tambah produk
          </Link>
        </div>
      </div>

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

      <div className="mt-6 overflow-x-auto border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-3 py-2">Produk</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2 text-right">Harga</th>
              <th className="px-3 py-2 text-center">Aktif</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-ink-soft">
                  Tidak ada produk.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id as string} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-line bg-paper-2">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url as string} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-mono text-[10px] text-ink-soft">—</span>
                        )}
                      </span>
                      <div>
                        <div className="font-medium leading-tight">{p.name as string}</div>
                        <div className="font-mono text-[11px] text-ink-soft">{(p.sku as string) || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-ink-soft">
                    {p.category_id ? titleCase(catMap.get(p.category_id as string) ?? "") : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">{formatRupiah(displayPrice(p as never))}</td>
                  <td className="px-3 py-2 text-center">
                    {p.is_active ? (
                      <span className="text-green-700">●</span>
                    ) : (
                      <span className="text-ink-soft">○</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/dashboard/produk/${p.id}`}
                      className="font-mono text-xs text-indigo-ink hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between font-mono text-xs">
          {page > 1 ? (
            <Link href={linkTo(page - 1)} className="border border-line px-3 py-2 hover:border-ink/40">
              ← Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-soft">Hal {page} / {pageCount}</span>
          {page < pageCount ? (
            <Link href={linkTo(page + 1)} className="border border-line px-3 py-2 hover:border-ink/40">
              Berikutnya →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
