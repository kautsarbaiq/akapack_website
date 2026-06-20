import { SITE, SITE_URL } from "@/lib/site";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Structured data global (schema.org) yang dirender sekali di root layout:
 * Organization + satu Store per cabang (sinyal lokal) + WebSite dengan
 * SearchAction (sitelinks search box). Geo/sameAs sengaja dikosongkan sampai
 * lat-lng & URL sosial asli tersedia (jangan isi data palsu).
 */
export function SiteJsonLd() {
  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#org`,
    name: SITE.name,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/apple-icon`,
    image: `${SITE_URL}/opengraph-image`,
    description:
      "Pusat grosir kemasan plastik, kertas, dan mesin pengemas di Bandung & Garut.",
    telephone: SITE.outlets[0].tel,
    areaServed: ["Bandung", "Garut", "Jawa Barat"],
  };

  const stores = SITE.outlets.map((o) => ({
    "@type": "Store",
    "@id": `${SITE_URL}/cabang#${o.key}`,
    name: o.name,
    parentOrganization: { "@id": `${SITE_URL}/#org` },
    url: `${SITE_URL}/cabang`,
    telephone: o.tel,
    image: `${SITE_URL}/opengraph-image`,
    priceRange: "$$",
    currenciesAccepted: "IDR",
    paymentAccepted: "Cash, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress: o.address,
      addressLocality: o.city,
      addressRegion: o.region,
      addressCountry: "ID",
    },
    areaServed: o.city,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS,
      opens: "08:00",
      closes: "17:00",
    },
  }));

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE.name,
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE_URL}/#org` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/produk?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [org, ...stores, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
