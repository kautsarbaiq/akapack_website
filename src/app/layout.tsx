import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { ChromeGate } from "@/components/ChromeGate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["500", "700"],
  display: "swap",
});
const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500"],
  display: "swap",
});

const TITLE_DEFAULT = "Grosir Kemasan Plastik & Mesin Bandung–Garut | Akapack";
const DESCRIPTION =
  "Grosir kemasan plastik, kertas, box & mesin pengemas di Bandung & Garut. 3.900+ produk harga grosir, stok nyata dari 2 cabang. Pesan via WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: "%s · Akapack",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "grosir kemasan",
    "grosir kemasan bandung",
    "grosir kemasan garut",
    "kemasan plastik bandung",
    "grosir plastik garut",
    "mesin pengemas",
    "cup plastik grosir",
    "paper bag grosir",
    "akapack",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Akapack",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${grotesk.variable} ${jbmono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <SiteJsonLd />
        <CartProvider>
          <ChromeGate>
            <SiteHeader />
          </ChromeGate>
          <main className="flex-1">{children}</main>
          <ChromeGate>
            <SiteFooter />
          </ChromeGate>
        </CartProvider>
      </body>
    </html>
  );
}
