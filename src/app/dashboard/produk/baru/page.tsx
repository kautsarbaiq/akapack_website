import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { titleCase } from "@/lib/format";
import { createProduct } from "../actions";

export default async function TambahProduk() {
  const supabase = await createSupabaseServer();
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
      <h1 className="mt-4 font-display text-2xl font-medium tracking-tight">Tambah produk</h1>
      <p className="mt-1 text-ink-soft">Produk baru otomatis muncul di katalog (jika diaktifkan).</p>

      <form action={createProduct} className="mt-6 space-y-5">
        <div>
          <label className={label}>Nama produk *</label>
          <input name="name" required placeholder="mis. Cup Plastik 12 oz" className={input} />
        </div>

        <div>
          <label className={label}>Deskripsi</label>
          <textarea
            name="description"
            rows={5}
            placeholder="Bahan, ukuran, isi per pak, kegunaan, dll."
            className={input}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Kategori</label>
            <select name="category_id" defaultValue="" className={input}>
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
            <input name="unit" placeholder="pcs / pak / dus" className={input} />
          </div>
          <div>
            <label className={label}>Harga (Rp) *</label>
            <input name="price" type="number" min="0" required defaultValue={0} className={input} />
          </div>
          <div>
            <label className={label}>Harga online (opsional)</label>
            <input name="price_online" type="number" min="0" className={input} />
          </div>
        </div>

        <div>
          <label className={label}>Foto produk</label>
          <input name="image" type="file" accept="image/*" className="mt-1 block text-sm" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked />
          Tampilkan di katalog (aktif)
        </label>

        <div className="flex gap-3 pt-2">
          <button className="bg-indigo px-6 py-3 text-sm font-medium text-white hover:opacity-90">
            Simpan produk
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
