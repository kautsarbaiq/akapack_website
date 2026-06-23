// Upload foto (tier high+medium) ke Supabase Storage + isi products.image_url.
// BUTUH SUPABASE_SERVICE_ROLE_KEY di .env.local. Idempotent (upsert + skip yang sudah ada).
// Pemakaian: node scripts/photo-match/upload.mjs [LIMIT]
//   LIMIT = jumlah maksimum diproses (untuk uji coba). Kosong = semua.
import { readFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname, basename } from "node:path";

const LIMIT = Number(process.argv[2]) || Infinity;
const OUT = "/tmp/photo-match";
const TMP = `${OUT}/resized`;
const BUCKET = "product-images";
const CONCURRENCY = 6;
const MAXDIM = 900;

const env = readFileSync(".env.local", "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^"|"$/g, "");
const URL = get("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE = get("SUPABASE_SERVICE_ROLE_KEY");
if (!URL || !SERVICE) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY belum ada di .env.local — upload dibatalkan.");
  process.exit(1);
}
const AUTH = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

const mime = (ext) =>
  ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

mkdirSync(TMP, { recursive: true });
const matches = JSON.parse(readFileSync(`${OUT}/matches.json`, "utf8"))
  .filter((m) => m.tier === "high" || m.tier === "medium")
  .slice(0, LIMIT === Infinity ? undefined : LIMIT);

let done = 0, failed = 0, i = 0;
const errors = [];

async function processOne(m) {
  const ext = extname(m.file).toLowerCase();
  const objName = `auto-${m.id}${ext === ".jpeg" ? ".jpg" : ext}`;
  const tmpFile = `${TMP}/${objName}`;
  try {
    // 1) resize/kompres
    execFileSync("sips", ["-Z", String(MAXDIM), m.path, "--out", tmpFile], { stdio: "ignore" });
    const bytes = readFileSync(tmpFile);
    // 2) upload (upsert)
    const up = await fetch(`${URL}/storage/v1/object/${BUCKET}/${objName}`, {
      method: "POST",
      headers: { ...AUTH, "Content-Type": mime(extname(objName)), "x-upsert": "true" },
      body: bytes,
    });
    if (!up.ok) throw new Error(`upload ${up.status}: ${(await up.text()).slice(0, 120)}`);
    const publicUrl = `${URL}/storage/v1/object/public/${BUCKET}/${objName}`;
    // 3) set image_url
    const pa = await fetch(`${URL}/rest/v1/products?id=eq.${m.id}`, {
      method: "PATCH",
      headers: { ...AUTH, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ image_url: publicUrl }),
    });
    if (!pa.ok) throw new Error(`patch ${pa.status}: ${(await pa.text()).slice(0, 120)}`);
    done++;
  } catch (e) {
    failed++;
    errors.push(`${m.name} (${m.id}): ${e.message}`);
  } finally {
    rmSync(tmpFile, { force: true });
  }
}

async function worker() {
  while (i < matches.length) {
    const m = matches[i++];
    await processOne(m);
    if (done % 50 === 0 && done > 0) console.log(`  …${done}/${matches.length} (gagal ${failed})`);
  }
}

console.log(`Mulai upload ${matches.length} foto (concurrency ${CONCURRENCY}, resize ${MAXDIM}px)…`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\nSELESAI: ${done} sukses, ${failed} gagal.`);
if (errors.length) console.log("Contoh error:\n" + errors.slice(0, 10).join("\n"));
rmSync(TMP, { recursive: true, force: true });
