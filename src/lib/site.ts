export const SITE = {
  name: "Akapack",
  tagline: "Grosir kemasan plastik & mesin",
  outlets: [
    {
      key: "bandung",
      name: "Akapack Bandung",
      address: "Jl. Ibrahim Adjie No. 147, Kiaracondong, Bandung",
      city: "Bandung",
      region: "Jawa Barat",
      phone: "0821-2101-0050",
      tel: "+6282121010050",
      wa: "6282121010050",
      hours: "Setiap hari · 08.00–17.00",
      role: "Cabang utama",
    },
    {
      key: "garut",
      name: "Toko Kemasan Garut",
      address: "Jl. Cimanuk No. 28, Tarogong Kidul, Garut",
      city: "Garut",
      region: "Jawa Barat",
      phone: "0821-2104-9478",
      tel: "+6282121049478",
      wa: "6282121049478",
      hours: "Setiap hari · 08.00–17.00",
      role: "Cabang",
    },
  ],
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const WA_PRIMARY = SITE.outlets[0].wa;

export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phone}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
