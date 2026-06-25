import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { titleCase } from "@/lib/format";
import { updateProduct } from "../actions";

export default async function EditProduk({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: p } = await supabase
    .from("products")
    .select("id,name,sku,description,category_id,unit,price,price_online,image_url,is_active")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const cats = await supabase.from("categories").select("id,name").order("name");
  const categories = cats.data ?? [];

  const label = "font-mono text-xs uppercase tracking-[0.1em] text-ink-soft";
  const input =
    "mt-1 w-full border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-ink";

  return (
    <div className="max-w-3xl">
      <nav className="font-mono text-xs text-ink-soft">
        <Link href="/dashboard/produk" className="hover:text-ink">← Produk</Link>
      </nav>
      <h1 className="mt-4 font-display text-2xl font-medium tracking-tight">Edit produk</h1>
      <p className="mt-1 font-mono text-xs text-ink-soft">SKU {(p.sku as string) || "—"}</p>

      <form action={updateProduct} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={p.id as string} />

        <div>
          <label className={label}>Nama produk</label>
          <input name="name" required defaultValue={(p.name as string) ?? ""} className={input} />
        </div>

        <div>
          <label className={label}>Deskripsi</label>
          <textarea
            name="description"
            rows={5}
            defaultValue={(p.description as string) ?? ""}
            placeholder="Tulis deskripsi produk, bahan, ukuran, isi per pak, dll."
            className={input}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Kategori</label>
            <select name="category_id" defaultValue={(p.category_id as string) ?? ""} className={input}>
              <option value="">— tanpa kategori —</option>
              {categories.map((c) => (
                <option key={c.id as string} value={c.id as string}>
                  {titleCase(c.name as string)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Satuan</label>
            <input name="unit" defaultValue={(p.unit as string) ?? ""} placeholder="pcs / pak / dus" className={input} />
          </div>
          <div>
            <label className={label}>Harga (Rp)</label>
            <input name="price" type="number" min="0" defaultValue={(p.price as number) ?? 0} className={input} />
          </div>
          <div>
            <label className={label}>Harga online (opsional)</label>
            <input
              name="price_online"
              type="number"
              min="0"
              defaultValue={(p.price_online as number) ?? ""}
              className={input}
            />
          </div>
        </div>

        <div>
          <label className={label}>Foto produk</label>
          <div className="mt-1 flex items-center gap-4">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url as string}
                alt=""
                className="h-20 w-20 shrink-0 border border-line object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center border border-dashed border-line font-mono text-[10px] text-ink-soft">
                belum ada
              </span>
            )}
            <input name="image" type="file" accept="image/*" className="text-sm" />
          </div>
          <p className="mt-1 font-mono text-[11px] text-ink-soft">
            Kosongkan jika tidak ingin mengubah foto.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={p.is_active as boolean} />
          Produk aktif (tampil di katalog)
        </label>

        <div className="flex gap-3 pt-2">
          <button className="bg-indigo px-6 py-3 text-sm font-medium text-white hover:opacity-90">
            Simpan perubahan
          </button>
          <Link
            href="/dashboard/produk"
            className="border border-ink px-6 py-3 text-sm font-medium hover:bg-ink hover:text-paper"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
