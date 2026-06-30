import Link from "next/link";
import { SITE, waLink, WA_PRIMARY } from "@/lib/site";
import { BrandLogo } from "@/components/BrandLogo";

const FOOTER_CATS: [string, string][] = [
  ["mesin", "Mesin Pengemas"],
  ["cup", "Cup & Gelas Plastik"],
  ["thinwall", "Wadah Thinwall"],
  ["botol", "Botol & Toples"],
  ["paperbox", "Paper Box & Kraft"],
  ["papercup", "Paper Cup"],
  ["kantong", "Plastik & Kresek"],
  ["flexibel", "Pouch & Sachet"],
];

const YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-2 border-indigo bg-card">
      {/* CTA bantuan */}
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <div className="text-base font-bold text-ink">Butuh bantuan pesan grosir?</div>
            <div className="text-sm text-ink-soft">
              Tim kami bantu pilihkan produk &amp; hitung harga grosir via WhatsApp.
            </div>
          </div>
          <a
            href={waLink(WA_PRIMARY, "Halo Akapack, saya mau tanya produk.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-success px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            Chat WhatsApp
          </a>
        </div>
      </div>

      {/* Kolom-kolom */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <BrandLogo className="h-9 w-auto" tagline={false} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            Pusat grosir kemasan plastik, kertas, box &amp; mesin pengemas. Harga grosir,
            stok nyata dari dua cabang di Bandung &amp; Garut.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-paper-2 px-3 py-1 text-xs font-medium text-ink-soft">
              3.900+ produk
            </span>
            <span className="rounded-full bg-paper-2 px-3 py-1 text-xs font-medium text-ink-soft">
              2 cabang
            </span>
            <span className="rounded-full bg-paper-2 px-3 py-1 text-xs font-medium text-ink-soft">
              Harga grosir
            </span>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-ink">Kategori Populer</h3>
          <ul className="space-y-2 text-sm">
            {FOOTER_CATS.map(([slug, label]) => (
              <li key={slug}>
                <Link href={`/produk/grup/${slug}`} className="text-ink-soft hover:text-indigo-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-ink">Informasi</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/produk" className="text-ink-soft hover:text-indigo-ink">Semua produk</Link></li>
            <li><Link href="/tentang" className="text-ink-soft hover:text-indigo-ink">Tentang kami</Link></li>
            <li><Link href="/cabang" className="text-ink-soft hover:text-indigo-ink">Lokasi cabang</Link></li>
            <li><Link href="/kontak" className="text-ink-soft hover:text-indigo-ink">Kontak &amp; bantuan</Link></li>
            <li><Link href="/grosir-kemasan-bandung" className="text-ink-soft hover:text-indigo-ink">Grosir kemasan Bandung</Link></li>
            <li><Link href="/grosir-kemasan-garut" className="text-ink-soft hover:text-indigo-ink">Grosir kemasan Garut</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-ink">Cabang Kami</h3>
          <ul className="space-y-4 text-sm">
            {SITE.outlets.map((o) => (
              <li key={o.key}>
                <div className="font-semibold text-ink">{o.name}</div>
                <div className="text-ink-soft">{o.address}</div>
                <div className="text-ink-soft">{o.hours}</div>
                <div className="mt-1 flex gap-3">
                  <a href={`tel:${o.tel}`} className="font-medium text-indigo-ink hover:underline">
                    {o.phone}
                  </a>
                  <a
                    href={waLink(o.wa)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-success hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sub-bar gelap */}
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-white/70 sm:px-6">
          <span>© {YEAR} {SITE.name}. Pembayaran via Transfer Bank. Harga dapat berubah sewaktu-waktu.</span>
          <Link href="/login?next=/dashboard" className="hover:text-white">
            Login karyawan →
          </Link>
        </div>
      </div>
    </footer>
  );
}
