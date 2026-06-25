import type { Metadata } from "next";
import { LocalLandingPage } from "@/components/LocalLandingPage";

export const metadata: Metadata = {
  title: "Grosir Kemasan Plastik & Mesin di Garut",
  description:
    "Grosir kemasan plastik, kertas, box, paper bag, cup & mesin pengemas di Garut (Tarogong Kidul). Harga grosir, stok nyata, pesan via WhatsApp — Toko Kemasan Garut.",
  alternates: { canonical: "/grosir-kemasan-garut" },
};

export default function Page() {
  return <LocalLandingPage city="garut" />;
}
