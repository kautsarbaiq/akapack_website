// Susun ringkasan kategori (+contoh produk) & folder (+contoh file) untuk
// pemetaan folder→kategori. Output: /tmp/photo-match/mapping-input.txt
import { readFileSync, writeFileSync } from "node:fs";
const OUT = "/tmp/photo-match";
const products = JSON.parse(readFileSync(`${OUT}/products.json`, "utf8"));
const categories = JSON.parse(readFileSync(`${OUT}/categories.json`, "utf8"));
const photos = JSON.parse(readFileSync(`${OUT}/photos.json`, "utf8"));

const prodByCat = {};
for (const p of products) (prodByCat[p.category_id] ??= []).push(p.name);
const filesByFolder = {};
for (const p of photos) (filesByFolder[p.folder] ??= []).push(p.file);

let out = "=== KATEGORI (id | nama | contoh produk) ===\n";
for (const c of categories.sort((a, b) => a.name.localeCompare(b.name))) {
  const samples = (prodByCat[c.id] ?? []).slice(0, 5).join(" | ");
  out += `${c.id} | ${c.name} | (${(prodByCat[c.id] ?? []).length} produk) ${samples}\n`;
}
out += "\n=== FOLDER FOTO (nama | jumlah | contoh file) ===\n";
for (const [f, files] of Object.entries(filesByFolder).sort((a, b) => b[1].length - a[1].length)) {
  out += `${f} | ${files.length} foto | ${files.slice(0, 8).join(" ; ")}\n`;
}
writeFileSync(`${OUT}/mapping-input.txt`, out);
console.log(`ditulis: ${OUT}/mapping-input.txt (${out.length} char)`);
