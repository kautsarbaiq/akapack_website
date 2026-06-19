import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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

const DESCRIPTION =
  "Pusat grosir kemasan plastik, kertas, dan mesin pengemas di Bandung & Garut. 3.900+ produk, harga grosir, stok nyata dari 2 cabang.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Akapack — Grosir Kemasan Plastik & Mesin",
    template: "%s · Akapack",
  },
  description: DESCRIPTION,
  keywords: [
    "grosir kemasan",
    "kemasan plastik bandung",
    "grosir plastik",
    "mesin pengemas",
    "kemasan garut",
    "akapack",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Akapack",
    title: "Akapack — Grosir Kemasan Plastik & Mesin",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Akapack — Grosir Kemasan Plastik & Mesin",
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
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
