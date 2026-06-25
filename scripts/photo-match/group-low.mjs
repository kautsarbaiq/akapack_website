// Kelompokkan produk tier LOW per folder kandidat (untuk pencocokan semantik).
// Output: /tmp/photo-match/low-groups.json = [{folder, products:[{id,name,sku}], photos:[file]}]
import { readFileSync, writeFileSync } from "node:fs";
const OUT = "/tmp/photo-match";
const matches = JSON.parse(readFileSync(`${OUT}/matches.json`, "utf8"));
const photos = JSON.parse(readFileSync(`${OUT}/photos.json`, "utf8"));

const filesByFolder = {};
for (const p of photos) (filesByFolder[p.folder] ??= []).push(p.file);

const low = matches.filter((m) => m.tier === "low" && m.folder && m.folder !== "PRODUK AKAPACK");
const groups = {};
for (const m of low) {
  (groups[m.folder] ??= []).push({ id: m.id, name: m.name, sku: m.sku });
}

const out = Object.entries(groups)
  .map(([folder, products]) => ({ folder, products, photos: filesByFolder[folder] || [] }))
  .filter((g) => g.photos.length > 0)
  .sort((a, b) => b.products.length - a.products.length);

writeFileSync(`${OUT}/low-groups.json`, JSON.stringify(out));
const totalProd = out.reduce((s, g) => s + g.products.length, 0);
const skipped = low.length - totalProd;
console.log(`grup: ${out.length} folder | produk LOW tercakup: ${totalProd} | dilewati(PRODUK AKAPACK-only): ${skipped}`);
console.log("top folder (produk x foto):");
for (const g of out.slice(0, 18))
  console.log(`  ${String(g.products.length).padStart(4)} prod x ${String(g.photos.length).padStart(4)} foto  ${g.folder}`);
