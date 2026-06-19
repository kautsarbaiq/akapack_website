import Link from "next/link";
import { SITE, waLink } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-paper-2">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-mono text-lg font-medium tracking-[0.22em]">AKAPACK</div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
              Pusat grosir kemasan plastik, kertas, dan mesin pengemas. Harga grosir,
              stok nyata dari dua cabang di Bandung &amp; Garut.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
              Navigasi
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/produk" className="text-ink-soft hover:text-ink">Katalog produk</Link></li>
              <li><Link href="/tentang" className="text-ink-soft hover:text-ink">Tentang kami</Link></li>
              <li><Link href="/cabang" className="text-ink-soft hover:text-ink">Cabang</Link></li>
              <li><Link href="/kontak" className="text-ink-soft hover:text-ink">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
              Cabang
            </h3>
            <ul className="space-y-4 text-sm">
              {SITE.outlets.map((o) => (
                <li key={o.key}>
                  <div className="font-medium text-ink">{o.name}</div>
                  <div className="text-ink-soft">{o.address}</div>
                  <a
                    href={waLink(o.wa)}
                    className="text-indigo-ink hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {o.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs text-ink-soft">
          © {new Date().getFullYear()} {SITE.name}. Seluruh harga dapat berubah sewaktu-waktu.
        </div>
      </div>
    </footer>
  );
}
