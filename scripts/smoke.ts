import { readFileSync } from "node:fs";

const ROOT = "/Users/macbookpro/Documents/akapack_website";
for (const line of readFileSync(`${ROOT}/.env.local`, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !m[1].startsWith("#")) process.env[m[1]] = m[2];
}

import {
  fetchCategories,
  fetchProductsPage,
  fetchStockFor,
} from "../src/lib/catalog";
import { displayPrice, formatRupiah, titleCase } from "../src/lib/format";

async function main() {
  const cats = await fetchCategories();
  console.log(`categories: ${cats.length} (contoh: ${cats.slice(0, 3).map((c) => titleCase(c.name)).join(", ")})`);

  const page = await fetchProductsPage({ page: 1, pageSize: 5, sort: "name" });
  console.log(`products total: ${page.total}, pageCount: ${page.pageCount}, halaman ini: ${page.products.length}`);

  const leak = page.products.some((p) => "cost_price" in (p as Record<string, unknown>));
  console.log(`cost_price bocor? ${leak ? "YA — BAHAYA" : "tidak (aman)"}`);

  const ids = page.products.map((p) => p.id);
  const stock = await fetchStockFor(ids);
  console.log("\ncontoh produk:");
  for (const p of page.products) {
    const s = stock[p.id];
    console.log(
      `  - ${p.name} [${p.sku}] ${formatRupiah(displayPrice(p))}/${p.unit ?? "?"} | Bandung ${s.bandung} · Garut ${s.garut}`,
    );
  }

  const search = await fetchProductsPage({ search: "kresek", pageSize: 3 });
  console.log(`\ncari "kresek": ${search.total} hasil`);
}

main().catch((e) => {
  console.error("SMOKE GAGAL:", e);
  process.exit(1);
});
