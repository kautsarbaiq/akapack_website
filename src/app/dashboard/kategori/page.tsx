import { createSupabaseServer } from "@/lib/supabase/server";
import { fetchCategoryCounts } from "@/lib/catalog";
import { titleCase } from "@/lib/format";
import { createCategory, renameCategory, toggleCategory } from "./actions";

export default async function KategoriPage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("categories")
    .select("id,name,is_active")
    .order("name", { ascending: true });
  const categories = data ?? [];

  let counts = new Map<string, number>();
  try {
    counts = (await fetchCategoryCounts()).byCategory;
  } catch {
    /* abaikan */
  }
  const fmt = new Intl.NumberFormat("id-ID");

  const inputCls =
    "border border-line bg-card px-3 py-2 text-sm outline-none focus:border-ink";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-medium tracking-tight">Kategori</h1>
      <p className="mt-1 text-ink-soft">{categories.length} kategori. Tambah atau ubah nama kategori produk.</p>

      {/* Tambah */}
      <form action={createCategory} className="mt-6 flex gap-2">
        <input name="name" required placeholder="Nama kategori baru…" className={`${inputCls} flex-1`} />
        <button className="bg-indigo px-5 py-2 text-sm font-medium text-white hover:opacity-90">
          + Tambah
        </button>
      </form>

      {/* Daftar */}
      <div className="mt-6 divide-y divide-line border border-line bg-card">
        {categories.map((c) => {
          const id = c.id as string;
          const active = c.is_active as boolean;
          return (
            <div key={id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <form action={renameCategory} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="id" value={id} />
                <input
                  name="name"
                  defaultValue={titleCase(c.name as string)}
                  className={`${inputCls} flex-1`}
                />
                <button className="border border-line px-3 py-2 text-xs font-medium hover:border-ink/40">
                  Simpan
                </button>
              </form>
              <span className="w-20 text-right font-mono text-xs text-ink-soft">
                {fmt.format(counts.get(id) ?? 0)} produk
              </span>
              <form action={toggleCategory}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="active" value={String(active)} />
                <button
                  className={
                    "w-24 border px-3 py-2 text-xs font-medium " +
                    (active
                      ? "border-green-600/40 text-green-700"
                      : "border-line text-ink-soft")
                  }
                >
                  {active ? "● Aktif" : "○ Nonaktif"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
