// Pecah low-groups.json jadi file per-folder + cetak daftar tugas (untuk args workflow).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const OUT = "/tmp/photo-match";
mkdirSync(`${OUT}/low`, { recursive: true });
const groups = JSON.parse(readFileSync(`${OUT}/low-groups.json`, "utf8"));
const tasks = groups.map((g, i) => {
  writeFileSync(`${OUT}/low/g${i}.json`, JSON.stringify(g));
  return { idx: i, folder: g.folder, count: g.products.length };
});
writeFileSync(`${OUT}/low-tasks.json`, JSON.stringify(tasks));
console.log(JSON.stringify(tasks));
