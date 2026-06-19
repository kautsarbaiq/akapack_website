export const SITE = {
  name: "Akapack",
  tagline: "Grosir kemasan plastik & mesin",
  outlets: [
    {
      key: "bandung",
      name: "Akapack Bandung",
      address: "Jl. Ibrahim Adjie No. 147, Kiaracondong, Bandung",
      phone: "0821-2101-0050",
      wa: "6282121010050",
      hours: "Senin–Sabtu · 08.00–17.00",
      role: "Cabang utama",
    },
    {
      key: "garut",
      name: "Toko Kemasan Garut",
      address: "Jl. Cimanuk No. 28, Tarogong Kidul, Garut",
      phone: "0821-2104-9478",
      wa: "6282121049478",
      hours: "Senin–Sabtu · 08.00–17.00",
      role: "Cabang",
    },
  ],
} as const;

export const WA_PRIMARY = SITE.outlets[0].wa;

export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phone}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
