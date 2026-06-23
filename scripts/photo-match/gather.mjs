// Kumpulkan data untuk pencocokan foto→produk (READ-ONLY, pakai anon key).
// Output ke /tmp/photo-match/: products.json, categories.json, photos.json
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const PHOTO_DIR = "/Users/macbookpro/Downloads/AKAPACK PRODUCT";
const OUT = "/tmp/photo-match";
mkdirSync(OUT, { recursive: true });

// --- baca env ---
const env = readFileSync(".env.local", "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^"|"$/g, "");
const URL = get("NEXT_PUBLIC_SUPABASE_URL");
const KEY = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// --- fetch produk (paginasi 1000) ---
async function fetchAll(path) {
  const all = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${URL}/rest/v1/${path}`, {
      headers: { ...H, Range: `${from}-${from + 999}` },
    });
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    all.push(...rows);
    if (rows.length < 1000) break;
  }
  return all;
}

const products = await fetchAll(
  "products?select=id,name,sku,barcode,category_id,image_url&is_active=eq.true&order=name.asc",
);
const categories = await fetchAll("categories?select=id,name&is_active=eq.true");
writeFileSync(`${OUT}/products.json`, JSON.stringify(products));
writeFileSync(`${OUT}/categories.json`, JSON.stringify(categories));

// --- indeks foto lokal (rekursif) ---
const IMG = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const photos = [];
function walk(dir, topFolder) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, topFolder ?? name);
    else if (IMG.has(extname(name).toLowerCase()))
      photos.push({ folder: topFolder ?? "(root)", file: name, path: full, size: st.size });
  }
}
walk(PHOTO_DIR, null);
writeFileSync(`${OUT}/photos.json`, JSON.stringify(photos));

// --- ringkasan ---
const byFolder = {};
for (const p of photos) byFolder[p.folder] = (byFolder[p.folder] ?? 0) + 1;
const noImg = products.filter((p) => !p.image_url).length;
console.log(`produk: ${products.length} (tanpa foto: ${noImg})`);
console.log(`kategori: ${categories.length}`);
console.log(`foto: ${photos.length} di ${Object.keys(byFolder).length} folder`);
console.log("foto per folder (top 20):");
for (const [f, n] of Object.entries(byFolder).sort((a, b) => b[1] - a[1]).slice(0, 20))
  console.log(`  ${String(n).padStart(4)}  ${f}`);
