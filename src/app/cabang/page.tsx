import type { Metadata } from "next";
import { SITE, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cabang Bandung & Garut — Alamat, Jam Buka & Peta",
  description:
    "Dua cabang Akapack: Akapack Bandung (Kiaracondong) & Toko Kemasan Garut (Tarogong Kidul). Alamat, jam buka, peta, telepon & WhatsApp.",
  alternates: { canonical: "/cabang" },
};

export default function CabangPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Cabang</div>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Dua cabang, stok nyata
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Kunjungi langsung untuk ambil sendiri, atau pesan online dan kami siapkan. Stok di katalog
        ditampilkan terpisah per cabang.
      </p>

      <div className="mt-10 space-y-6">
        {SITE.outlets.map((o) => (
          <div key={o.key} className="grid gap-px border border-line bg-line lg:grid-cols-2">
            {/* Info */}
            <div className="bg-card p-6 sm:p-8">
              <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">{o.role}</div>
              <h2 className="mt-2 font-display text-2xl font-medium">{o.name}</h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-soft">Alamat</dt>
                  <dd className="mt-1 leading-relaxed">{o.address}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-soft">Jam buka</dt>
                  <dd className="mt-1">{o.hours}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-soft">Telepon / WA</dt>
                  <dd className="mt-1">{o.phone}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={waLink(o.wa, `Halo ${o.name}, saya mau tanya produk & stok.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  WhatsApp
                </a>
                <a
                  href={`tel:${o.tel}`}
                  className="border border-ink px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-paper"
                >
                  Telepon
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-ink px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-paper"
                >
                  Buka di Maps
                </a>
              </div>
            </div>

            {/* Peta */}
            <div className="min-h-[280px] bg-paper-2">
              <iframe
                title={`Peta ${o.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(o.address)}&z=15&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[280px] w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
