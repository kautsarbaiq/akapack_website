// Bangun preview visual: ambil sampel tiap tier, resize thumbnail ke
// public/_fotopreview/, tulis index.html (dilayani dev server untuk di-screenshot).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
const OUT = "/tmp/photo-match";
const DIR = "public/_fotopreview";
rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });

const matches = JSON.parse(readFileSync(`${OUT}/matches.json`, "utf8"));
const PER = 21;
function sample(tier) {
  const list = matches.filter((m) => m.tier === tier);
  if (list.length <= PER) return list;
  const step = list.length / PER;
  return Array.from({ length: PER }, (_, i) => list[Math.floor(i * step)]);
}

const tiers = [
  ["high", "HIGH — nama cocok kuat", "#15803d"],
  ["medium", "MEDIUM — nama cocok sebagian", "#b45309"],
  ["low", "LOW — foto perwakilan tipe (generik, cek akurasi)", "#b91c1c"],
];

let cards = "";
let idx = 0;
for (const [tier, label, color] of tiers) {
  cards += `<h2 style="color:${color}">${label}</h2><div class="grid">`;
  for (const m of sample(tier)) {
    const thumb = `${tier}-${idx}.jpg`;
    try {
      execFileSync("sips", ["-Z", "300", m.path, "--out", `${DIR}/${thumb}`], { stdio: "ignore" });
    } catch { continue; }
    cards += `<div class="card"><img src="./${thumb}" loading="lazy"/>
      <div class="meta"><b>${m.name}</b><span>${m.sku ?? ""}</span>
      <span class="f">${m.folder}/${m.file}</span>
      <span class="s">skor ${m.score ?? "-"}</span></div></div>`;
    idx++;
  }
  cards += `</div>`;
}

const html = `<!doctype html><meta charset="utf8"><title>Preview Foto Produk</title>
<style>
body{font-family:system-ui;margin:24px;background:#f4f1e9;color:#1a1916}
h1{font-size:22px} h2{margin-top:32px;font-size:15px;text-transform:uppercase;letter-spacing:1px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.card{background:#fff;border:1px solid #e0d9c8}
.card img{width:100%;height:180px;object-fit:cover;display:block;background:#eee}
.meta{padding:8px;display:flex;flex-direction:column;gap:2px;font-size:12px}
.meta b{font-size:12px;line-height:1.3} .meta span{color:#6f6e66}
.meta .f{font-size:10px;font-family:monospace} .meta .s{font-size:10px}
</style>
<h1>Preview pencocokan foto → produk (sampel tiap tier)</h1>
<p>HIGH ${matches.filter(m=>m.tier==="high").length} · MEDIUM ${matches.filter(m=>m.tier==="medium").length} · LOW ${matches.filter(m=>m.tier==="low").length} · none ${matches.filter(m=>m.tier==="none").length}</p>
${cards}`;
writeFileSync(`${DIR}/index.html`, html);
console.log(`preview: http://localhost:3000/_fotopreview/index.html (${idx} thumbnail)`);
