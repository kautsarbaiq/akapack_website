import { createSupabaseServer } from "@/lib/supabase/server";
import { CATEGORY_GROUPS, OTHER_GROUP, groupDefaultOrder } from "@/lib/category-groups";
import { saveGroup, clearGroupImage } from "./actions";

interface Setting {
  slug: string;
  label: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export default async function GrupPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("group_settings").select("*");
  const map = new Map<string, Setting>((data ?? []).map((r) => [r.slug as string, r as Setting]));

  const groups = [...CATEGORY_GROUPS.map((g) => ({ slug: g.slug, label: g.label })), OTHER_GROUP];

  const input = "mt-1 w-full border border-line bg-card px-3 py-2 text-sm outline-none focus:border-ink";
  const label = "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft";

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-medium tracking-tight">Kartu kategori beranda</h1>
      <p className="mt-1 text-ink-soft">
        Atur foto, urutan, dan nama kartu kategori yang tampil di halaman depan. Urutan kecil tampil
        lebih dulu.
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

      <div className="mt-6 space-y-3">
        {groups.map((g) => {
          const s = map.get(g.slug);
          return (
            <form
              key={g.slug}
              action={saveGroup}
              className="flex flex-wrap items-center gap-4 border border-line bg-card p-4"
            >
              <input type="hidden" name="slug" value={g.slug} />
              {/* Preview foto */}
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-line bg-paper-2">
                {s?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-mono text-[10px] text-ink-soft">foto</span>
                )}
              </span>

              <div className="min-w-[140px] flex-1">
                <label className={label}>Nama kartu</label>
                <input name="label" defaultValue={s?.label ?? g.label} className={input} />
              </div>

              <div className="w-20">
                <label className={label}>Urutan</label>
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={s?.sort_order ?? groupDefaultOrder(g.slug)}
                  className={input}
                />
              </div>

              <div className="min-w-[150px]">
                <label className={label}>Ganti foto</label>
                <input name="image" type="file" accept="image/*" className="mt-1 block text-xs" />
              </div>

              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={s?.is_active ?? true} />
                Tampil
              </label>

              <div className="flex gap-2 self-end pb-1">
                <button className="bg-indigo px-4 py-2 text-xs font-medium text-white hover:opacity-90">
                  Simpan
                </button>
              </div>
            </form>
          );
        })}
      </div>

      {/* Hapus foto (form terpisah agar tidak ikut submit utama) */}
      <details className="mt-6 text-sm text-ink-soft">
        <summary className="cursor-pointer">Hapus foto sebuah kartu?</summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {groups
            .filter((g) => map.get(g.slug)?.image_url)
            .map((g) => (
              <form key={g.slug} action={clearGroupImage}>
                <input type="hidden" name="slug" value={g.slug} />
                <button className="border border-line px-3 py-1.5 text-xs hover:border-ink/40">
                  Hapus foto: {map.get(g.slug)?.label ?? g.label}
                </button>
              </form>
            ))}
        </div>
      </details>
    </div>
  );
}
