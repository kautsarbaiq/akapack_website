// Cocokkan tiap produk (tanpa foto) ke 1 foto terbaik.
// Strategi: kandidat = foto di folder yang dipetakan ke kategori produk;
// skor = kemiripan token nama produk vs nama file; fallback = foto perwakilan folder.
// Output: /tmp/photo-match/matches.json + matches.csv + statistik.
import { readFileSync, writeFileSync } from "node:fs";
const OUT = "/tmp/photo-match";
const products = JSON.parse(readFileSync(`${OUT}/products.json`, "utf8"));
const photos = JSON.parse(readFileSync(`${OUT}/photos.json`, "utf8"));
const folderMap = JSON.parse(readFileSync(`${OUT}/folder-map.json`, "utf8"));

const catFolders = new Map(folderMap.map((m) => [m.categoryId, m.folders || []]));

const STOP = new Set(["isi", "pcs", "pc", "set", "uk", "ukuran", "dan", "untuk", "the", "size"]);
function toks(s) {
  return s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

// pra-hitung token tiap foto + indeks per folder
const photoTok = photos.map((p) => ({ ...p, t: new Set(toks(p.file)) }));
const byFolder = new Map();
for (const p of photoTok) {
  if (!byFolder.has(p.folder)) byFolder.set(p.folder, []);
  byFolder.get(p.folder).push(p);
}
// foto perwakilan per folder = nama terpendek (paling generik)
const repOf = new Map();
for (const [f, list] of byFolder)
  repOf.set(f, [...list].sort((a, b) => a.file.length - b.file.length)[0]);

function score(ptArr, photo) {
  const pt = new Set(ptArr);
  if (pt.size === 0 || photo.t.size === 0) return 0;
  let shared = 0;
  for (const t of pt) if (photo.t.has(t)) shared++;
  if (shared === 0) return 0;
  const union = new Set([...pt, ...photo.t]).size;
  const jac = shared / union;
  const cover = shared / pt.size;
  return 0.45 * jac + 0.55 * cover;
}

const HIGH = 0.5, MED = 0.28;
const matches = [];
const stats = { high: 0, medium: 0, low: 0, none: 0, hasImage: 0 };

for (const prod of products) {
  if (prod.image_url) { stats.hasImage++; continue; }
  const folders = catFolders.get(prod.category_id) || [];
  const specific = folders.filter((f) => f !== "PRODUK AKAPACK");
  const pt = toks(prod.name);

  // 1) cari skor terbaik di folder spesifik
  let best = null;
  for (const f of specific)
    for (const ph of byFolder.get(f) || []) {
      const s = score(pt, ph);
      if (!best || s > best.s) best = { s, ph, f };
    }
  // 2) jika lemah & boleh, coba juga PRODUK AKAPACK (catch-all)
  if ((!best || best.s < HIGH) && folders.includes("PRODUK AKAPACK"))
    for (const ph of byFolder.get("PRODUK AKAPACK") || []) {
      const s = score(pt, ph);
      if (!best || s > best.s) best = { s, ph, f: "PRODUK AKAPACK" };
    }

  let tier, chosen;
  if (best && best.s >= HIGH) { tier = "high"; chosen = best; }
  else if (best && best.s >= MED) { tier = "medium"; chosen = best; }
  else if (specific.length) {
    // fallback: foto perwakilan folder spesifik pertama (tipe-level)
    const rep = repOf.get(specific[0]);
    if (rep) { tier = "low"; chosen = { s: best?.s || 0, ph: rep, f: specific[0] }; }
  }
  if (!chosen) { stats.none++; matches.push({ id: prod.id, name: prod.name, tier: "none" }); continue; }

  stats[tier]++;
  matches.push({
    id: prod.id, name: prod.name, sku: prod.sku, category_id: prod.category_id,
    tier, score: +chosen.s.toFixed(3), folder: chosen.f,
    file: chosen.ph.file, path: chosen.ph.path,
  });
}

writeFileSync(`${OUT}/matches.json`, JSON.stringify(matches));
const csv = ["tier,score,product,sku,folder,file"]
  .concat(matches.filter((m) => m.tier !== "none").map((m) =>
    [m.tier, m.score, `"${m.name}"`, m.sku, `"${m.folder}"`, `"${m.file}"`].join(",")))
  .join("\n");
writeFileSync(`${OUT}/matches.csv`, csv);

console.log("STATISTIK (3820 produk tanpa foto):");
console.log(`  high   (nama cocok kuat)   : ${stats.high}`);
console.log(`  medium (nama cocok sebagian): ${stats.medium}`);
console.log(`  low    (perwakilan tipe)    : ${stats.low}`);
console.log(`  none   (tak ada folder)     : ${stats.none}`);
console.log(`  total dapat foto            : ${stats.high + stats.medium + stats.low}`);
console.log("\nContoh HIGH:");
for (const m of matches.filter((m) => m.tier === "high").slice(0, 8)) console.log(`  [${m.score}] ${m.name}  ←  ${m.folder}/${m.file}`);
console.log("\nContoh MEDIUM:");
for (const m of matches.filter((m) => m.tier === "medium").slice(0, 6)) console.log(`  [${m.score}] ${m.name}  ←  ${m.folder}/${m.file}`);
console.log("\nContoh LOW (perwakilan):");
for (const m of matches.filter((m) => m.tier === "low").slice(0, 6)) console.log(`  ${m.name}  ←  ${m.folder}/${m.file}`);
