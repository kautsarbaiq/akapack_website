import Link from "next/link";

const TILES = [
  {
    href: "/produk/grup/mesin",
    eyebrow: "MESIN PENGEMAS",
    title: "Sealer, Vacuum & Filling",
    sub: "Lengkapi produksimu",
    grad: "from-[#1a1916] to-[#c2410c]",
  },
  {
    href: "/produk/grup/cup",
    eyebrow: "KEMASAN MINUMAN",
    title: "Cup, Gelas & Paper Cup",
    sub: "Ribuan pilihan ukuran",
    grad: "from-[#c2410c] to-[#ea580c]",
  },
  {
    href: "/produk/grup/thinwall",
    eyebrow: "KEMASAN MAKANAN",
    title: "Thinwall, Box & Tray",
    sub: "Food grade, aman & rapi",
    grad: "from-[#1a1916] to-[#3f3a34]",
  },
];

/** 3 banner promo kecil (CTA ke grup) — gaya marketplace. */
export function PromoTiles() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {TILES.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`group relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${t.grad} p-5 text-white shadow-card transition-shadow hover:shadow-card-hover`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange">
              {t.eyebrow}
            </div>
            <div className="mt-1 text-lg font-extrabold leading-tight">{t.title}</div>
            <div className="mt-0.5 text-sm text-white/70">{t.sub}</div>
          </div>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-white">
            Lihat produk
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
