import type { Metadata } from "next";
import { SITE, waLink } from "@/lib/site";
import { ContactWaForm } from "@/components/ContactWaForm";

export const metadata: Metadata = {
  title: "Kontak — Akapack Bandung & Garut",
  description:
    "Hubungi Akapack via WhatsApp atau telepon untuk pertanyaan produk, cek stok, dan pemesanan grosir di cabang Bandung & Garut.",
  alternates: { canonical: "/kontak" },
};

export default function KontakPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">Kontak</div>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
        Ada yang bisa kami bantu?
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Tim kami siap bantu pilih produk, cek stok, dan proses pesanan grosir. Cara tercepat:
        WhatsApp langsung ke cabang.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Kontak per cabang */}
        <div className="space-y-4">
          {SITE.outlets.map((o) => (
            <div key={o.key} className="border border-line bg-card p-6">
              <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">{o.role}</div>
              <h2 className="mt-2 font-display text-xl font-medium">{o.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{o.address}</p>
              <p className="mt-1 text-sm text-ink-soft">{o.hours}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={waLink(o.wa, `Halo ${o.name}, saya mau bertanya.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-ink px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-paper"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                  WhatsApp {o.phone}
                </a>
                <a
                  href={`tel:${o.tel}`}
                  className="inline-flex items-center border border-ink px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-paper"
                >
                  Telepon
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <ContactWaForm />
      </div>
    </div>
  );
}
