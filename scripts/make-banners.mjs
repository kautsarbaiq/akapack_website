// Bikin poster banner demo (oranye-hitam) dari foto produk asli, upload ke Storage,
// lalu isi tabel `banners`. Idempotent: hapus dulu banner demo lama (objek demo-banner-*).
// Pakai: node scripts/make-banners.mjs
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const LOCAL = process.env.LOCAL === "1"; // render ke /tmp/banners tanpa upload/insert

const env = readFileSync(".env.local", "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^"|"$/g, "");
const URL = get("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE = get("SUPABASE_SERVICE_ROLE_KEY");
const ANON = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (!URL || !SERVICE || !ANON) { console.error("❌ URL/SERVICE/ANON key kosong"); process.exit(1); }
const AUTH = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }; // tulis (storage + insert)
const READ = { apikey: ANON, Authorization: `Bearer ${ANON}` };       // baca (RLS publik)
const BUCKET = "product-images";

const W = 1600, H = 640; // rasio 5:2 — cocok dgn slide aspect-[5/2] (tanpa crop)
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Tema banner + kata kunci kategori untuk memilih foto produk yang cocok.
const THEMES = [
  { kw: ["cup", "gelas"], eyebrow: "GROSIR KEMASAN PLASTIK", title: "Cup & Gelas Plastik", sub: "Ribuan pilihan ukuran — harga grosir, stok nyata.", link: "/produk/grup/cup" },
  { kw: ["thinwall", "kotak makan", "container"], eyebrow: "FOOD GRADE", title: "Thinwall & Wadah Makanan", sub: "Tahan microwave & freezer, aman untuk makanan.", link: "/produk/grup/thinwall" },
  { kw: ["botol", "pump", "spray"], eyebrow: "BOTOL & KEMASAN CAIR", title: "Botol Plastik Serbaguna", sub: "Kosmetik, minuman, sabun — lengkap dengan tutup.", link: "/produk/grup/botol" },
  { kw: ["mesin", "sealer", "vacuum", "filling"], eyebrow: "MESIN PENGEMAS", title: "Mesin Pengemas Lengkap", sub: "Sealer, vacuum, filling — siap untuk usahamu.", link: "/produk/grup/mesin" },
  { kw: ["paper", "kertas", "box", "rice", "lunch"], eyebrow: "KEMASAN KERTAS", title: "Paper Cup, Box & Lunch", sub: "Kemasan kertas food grade, ramah lingkungan.", link: "/produk/grup/papercup" },
];

async function jget(path) {
  const r = await fetch(`${URL}/rest/v1/${path}`, { headers: READ });
  if (!r.ok) throw new Error(`${path} → ${r.status}: ${(await r.text()).slice(0, 120)}`);
  return r.json();
}

// 1) Ambil kategori + produk berfoto.
const cats = await jget("categories?select=id,name");
const catName = new Map(cats.map((c) => [c.id, (c.name || "").toLowerCase()]));
const prods = await jget(
  "products?select=id,name,image_url,category_id&image_url=not.is.null&image_url=neq.&limit=3000",
);
console.log(`Kandidat: ${cats.length} kategori, ${prods.length} produk berfoto.`);

function pickFor(theme, used) {
  for (const p of prods) {
    if (used.has(p.id)) continue;
    const cn = catName.get(p.category_id) || "";
    const nm = (p.name || "").toLowerCase();
    if (theme.kw.some((k) => cn.includes(k) || nm.includes(k))) return p;
  }
  return null;
}

async function fetchImg(u) {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`img ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

function overlaySvg(theme) {
  const titleLen = theme.title.length;
  const titleSize = titleLen > 22 ? 58 : titleLen > 16 ? 66 : 74;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0.42" stop-color="#100f0d" stop-opacity="1"/>
        <stop offset="0.6" stop-color="#100f0d" stop-opacity="0.82"/>
        <stop offset="0.82" stop-color="#100f0d" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.45"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#fade)"/>
    <rect width="${W}" height="${H}" fill="url(#bot)"/>
    <rect x="96" y="150" width="46" height="6" fill="#ea580c"/>
    <text x="160" y="162" font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="4" fill="#ea580c">${esc(theme.eyebrow)}</text>
    <text x="94" y="${titleSize > 60 ? 270 : 262}" font-family="Helvetica,Arial,sans-serif" font-size="${titleSize}" font-weight="800" fill="#ffffff">${esc(theme.title)}</text>
    <text x="96" y="335" font-family="Helvetica,Arial,sans-serif" font-size="27" font-weight="400" fill="#e8e6e0">${esc(theme.sub)}</text>
    <rect x="96" y="392" width="280" height="62" rx="6" fill="#ea580c"/>
    <text x="236" y="431" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="23" font-weight="700" fill="#ffffff">Lihat Produk  →</text>
    <text x="${W - 70}" y="${H - 48}" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="26" font-weight="800" fill="#ffffff" opacity="0.92">akapack<tspan fill="#ea580c">.com</tspan></text>
  </svg>`);
}

async function compose(theme, photoBuf) {
  const base = await sharp({ create: { width: W, height: H, channels: 3, background: "#14130f" } }).png().toBuffer();
  const photo = await sharp(photoBuf).resize(820, H, { fit: "cover", position: "centre" }).toBuffer();
  return sharp(base)
    .composite([
      { input: photo, left: W - 820, top: 0 },
      { input: overlaySvg(theme), left: 0, top: 0 },
    ])
    .jpeg({ quality: 84 })
    .toBuffer();
}

// 2) Hapus banner demo lama.
await fetch(`${URL}/rest/v1/banners?image_url=like.*demo-banner*`, { method: "DELETE", headers: { ...AUTH, Prefer: "return=minimal" } });

// 3) Susun, upload, insert.
const used = new Set();
let order = 1;
for (const theme of THEMES) {
  const p = pickFor(theme, used);
  if (!p) { console.log(`⚠️  ${theme.title}: tak ada foto cocok, dilewati`); continue; }
  used.add(p.id);
  try {
    const buf = await compose(theme, await fetchImg(p.image_url));
    const objName = `demo-banner-${order}.jpg`;
    if (LOCAL) {
      mkdirSync("/tmp/banners", { recursive: true });
      writeFileSync(`/tmp/banners/${objName}`, buf);
      console.log(`✓ ${order}. ${theme.title}  ←  ${p.name}  → /tmp/banners/${objName}`);
      order++;
      continue;
    }
    const up = await fetch(`${URL}/storage/v1/object/${BUCKET}/${objName}`, {
      method: "POST",
      headers: { ...AUTH, "Content-Type": "image/jpeg", "x-upsert": "true" },
      body: buf,
    });
    if (!up.ok) throw new Error(`upload ${up.status}: ${(await up.text()).slice(0, 120)}`);
    const image_url = `${URL}/storage/v1/object/public/${BUCKET}/${objName}`;
    const ins = await fetch(`${URL}/rest/v1/banners`, {
      method: "POST",
      headers: { ...AUTH, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ image_url, link: theme.link, sort_order: order, is_active: true }),
    });
    if (!ins.ok) throw new Error(`insert ${ins.status}: ${(await ins.text()).slice(0, 120)}`);
    console.log(`✓ ${order}. ${theme.title}  ←  ${p.name}`);
    order++;
  } catch (e) {
    console.log(`✗ ${theme.title}: ${e.message}`);
  }
}
console.log(`\nSelesai: ${order - 1} banner dibuat.`);
