import type { Product } from "./types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number | null | undefined): string {
  return rupiah.format(Math.round(value ?? 0));
}

/** Harga tampil = price_online jika ada, jika tidak fallback ke price. */
export function displayPrice(p: Pick<Product, "price" | "price_online">): number {
  return p.price_online ?? p.price;
}

/** Nama kategori di DB campur kapital/typo → rapikan ke Title Case untuk tampilan. */
export function titleCase(name: string): string {
  return name
    .toLocaleLowerCase("id-ID")
    .split(/\s+/)
    .map((w) => (w ? w[0].toLocaleUpperCase("id-ID") + w.slice(1) : w))
    .join(" ");
}

/** Inisial untuk monogram placeholder (huruf pertama yang bermakna). */
export function monogram(name: string): string {
  const m = name.trim().match(/[A-Za-z0-9]/);
  return (m ? m[0] : "?").toUpperCase();
}
