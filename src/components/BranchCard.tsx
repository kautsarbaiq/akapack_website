import { waLink } from "@/lib/site";

export interface Outlet {
  key: string;
  name: string;
  address: string;
  phone: string;
  wa: string;
  hours: string;
  role: string;
}

/** Kartu cabang ringkas dengan alamat, jam buka, WhatsApp & Maps. */
export function BranchCard({ outlet: o }: { outlet: Outlet }) {
  return (
    <div className="flex flex-col border border-line bg-card p-6">
      <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">{o.role}</div>
      <h3 className="mt-2 font-display text-xl font-medium">{o.name}</h3>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex gap-3">
          <dt className="w-14 shrink-0 font-mono text-xs uppercase tracking-[0.06em] text-ink-soft">
            Alamat
          </dt>
          <dd className="leading-relaxed">{o.address}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-14 shrink-0 font-mono text-xs uppercase tracking-[0.06em] text-ink-soft">
            Jam
          </dt>
          <dd>{o.hours}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={waLink(o.wa, `Halo ${o.name}, saya mau tanya produk & stok.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          WhatsApp {o.phone}
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-paper"
        >
          Maps
        </a>
      </div>
    </div>
  );
}
