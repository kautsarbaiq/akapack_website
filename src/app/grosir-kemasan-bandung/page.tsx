import type { Metadata } from "next";
import { LocalLandingPage } from "@/components/LocalLandingPage";

export const metadata: Metadata = {
  title: "Grosir Kemasan Plastik & Mesin di Bandung",
  description:
    "Grosir kemasan plastik, kertas, box, paper bag, cup & mesin pengemas di Bandung (Kiaracondong). Harga grosir, stok nyata, pesan via WhatsApp — Akapack.",
  alternates: { canonical: "/grosir-kemasan-bandung" },
};

export default function Page() {
  return <LocalLandingPage city="bandung" />;
}
