const ITEMS = [
  {
    title: "Harga Grosir",
    sub: "Makin banyak makin murah",
    icon: (
      <path d="M3 7h18M3 7l2-3h14l2 3M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7M9 11h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "2 Cabang",
    sub: "Bandung & Garut · stok nyata",
    icon: (
      <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    ),
  },
  {
    title: "Pesan via WhatsApp",
    sub: "Dibantu tim, respon cepat",
    icon: (
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    ),
  },
  {
    title: "Buka Tiap Hari",
    sub: "08.00 – 17.00 WIB",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export function ServiceStrip() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
      {ITEMS.map((it) => (
        <div key={it.title} className="flex items-center gap-3 bg-card px-4 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-wash text-indigo-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {it.icon}
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">{it.title}</span>
            <span className="block truncate text-xs text-ink-soft">{it.sub}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
