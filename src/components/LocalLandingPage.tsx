import Link from "next/link";
import { SITE, SITE_URL, waLink } from "@/lib/site";
import { CATEGORY_GROUPS } from "@/lib/category-groups";
import { BranchCard } from "@/components/BranchCard";
import { CtaBand } from "@/components/CtaBand";

type CityKey = "bandung" | "garut";

const CONTENT: Record<
  CityKey,
  { h1: string; lead: string; paras: string[]; areas: string }
> = {
  bandung: {
    h1: "Grosir Kemasan Plastik & Mesin Pengemas di Bandung",
    lead: "Cari grosir kemasan di Bandung? Akapack adalah pusat grosir kemasan plastik, kertas, box, paper bag, cup, hingga mesin pengemas untuk pelaku usaha di Bandung dan sekitarnya.",
    paras: [
      "Cabang utama kami berada di Jl. Ibrahim Adjie No. 147, Kiaracondong, Bandung — mudah dijangkau dari berbagai penjuru kota. Lebih dari 3.900 produk tersedia dengan harga grosir dan stok yang ditampilkan apa adanya, jadi Anda tahu pasti barang ready sebelum datang.",
      "Kami melayani UMKM kuliner, kafe & kedai minuman, katering, toko kue dan bakery, frozen food, hingga online seller. Mulai dari cup plastik, gelas, sedotan, box makanan, mika, thinwall, paper bag, kantong plastik, sampai mesin sealer dan mixer — semua bisa didapat di satu tempat.",
      "Belanja bisa langsung di toko (ambil sendiri) atau pesan online lalu kami kirim. Pembayaran transfer atau COD. Butuh bantuan memilih produk atau mesin yang sesuai? Tim kami siap membantu lewat WhatsApp.",
    ],
    areas: "Bandung, Cimahi, Bandung Barat, Soreang, Banjaran, dan sekitarnya",
  },
  garut: {
    h1: "Grosir Kemasan Plastik & Mesin Pengemas di Garut",
    lead: "Cari grosir kemasan di Garut? Toko Kemasan Garut (Akapack) menyediakan kemasan plastik, kertas, box, paper bag, cup, hingga mesin pengemas dengan harga grosir untuk pelaku usaha di Garut dan sekitarnya.",
    paras: [
      "Cabang kami berada di Jl. Cimanuk No. 28, Tarogong Kidul, Garut — lokasi strategis di pusat keramaian. Ribuan produk tersedia dengan harga grosir dan stok nyata yang tersinkron dengan kasir toko.",
      "Cocok untuk UMKM kuliner, katering, kafe, toko kue, frozen food, dan online seller di Garut. Tersedia cup & gelas plastik, sedotan, box makanan, mika, thinwall, paper bag, kantong plastik, hingga mesin sealer dan timbangan.",
      "Ambil langsung di toko atau pesan online untuk dikirim. Pembayaran transfer atau COD. Konsultasi pemilihan produk maupun mesin bisa lewat WhatsApp kapan saja.",
    ],
    areas: "Garut, Tarogong, Wanaraja, Tasikmalaya, Sumedang, dan sekitarnya",
  },
};

const POPULAR = ["cup", "box", "plastik", "kertas", "baking", "botol", "mesin"];

export function LocalLandingPage({ city }: { city: CityKey }) {
  const outlet = SITE.outlets.find((o) => o.key === city)!;
  const c = CONTENT[city];
  const labelOf = (slug: string) => CATEGORY_GROUPS.find((g) => g.slug === slug)?.label ?? slug;

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Store",
        "@id": `${SITE_URL}/cabang#${outlet.key}`,
        name: outlet.name,
        url: `${SITE_URL}/grosir-kemasan-${city}`,
        parentOrganization: { "@id": `${SITE_URL}/#org` },
        telephone: outlet.tel,
        image: `${SITE_URL}/opengraph-image`,
        priceRange: "$$",
        currenciesAccepted: "IDR",
        paymentAccepted: "Cash, Bank Transfer",
        address: {
          "@type": "PostalAddress",
          streetAddress: outlet.address,
          addressLocality: outlet.city,
          addressRegion: outlet.region,
          addressCountry: "ID",
        },
        areaServed: c.areas,
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "17:00",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: c.h1, item: `${SITE_URL}/grosir-kemasan-${city}` },
        ],
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <nav className="font-mono text-xs text-ink-soft" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink">Beranda</Link>
            <span className="px-1.5">/</span>
            <span className="text-ink">Grosir Kemasan {outlet.city}</span>
          </nav>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            {c.h1}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{c.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/produk"
              className="bg-indigo px-6 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Lihat katalog
            </Link>
            <a
              href={waLink(outlet.wa, `Halo ${outlet.name}, saya mau tanya produk.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ink px-6 py-3 text-sm font-medium hover:bg-ink hover:text-paper"
            >
              WhatsApp {outlet.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Konten */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4 text-base leading-relaxed text-ink-soft">
            {c.paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="text-sm">Melayani area: {c.areas}.</p>
          </div>
          <BranchCard outlet={outlet} />
        </div>

        {/* Kategori populer */}
        <h2 className="mt-14 font-display text-2xl font-medium tracking-tight">
          Kategori populer di {outlet.city}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {POPULAR.map((slug) => (
            <Link
              key={slug}
              href={`/produk/grup/${slug}`}
              className="border border-line bg-card p-4 font-medium transition-colors hover:border-ink/25 hover:bg-paper-2"
            >
              {labelOf(slug)}
            </Link>
          ))}
        </div>
      </section>

      {/* Peta */}
      <section className="border-t border-line">
        <iframe
          title={`Peta ${outlet.name}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(outlet.address)}&z=15&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[320px] w-full"
        />
      </section>

      <CtaBand />
    </div>
  );
}
