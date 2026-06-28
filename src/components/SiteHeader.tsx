import Link from "next/link";
import { CartButton } from "@/components/CartButton";
import { AuthButton } from "@/components/AuthButton";
import { BrandLogo } from "@/components/BrandLogo";

const NAV: [string, string][] = [
  ["Beranda", "/"],
  ["Produk", "/produk"],
  ["Tentang", "/tentang"],
  ["Cabang", "/cabang"],
  ["Kontak", "/kontak"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper-2/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Akapack — beranda" className="shrink-0">
          <BrandLogo className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {NAV.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-ink-soft transition-colors hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/produk"
            aria-label="Cari produk"
            className="flex items-center gap-2 border border-line bg-card px-3 py-2 text-sm text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            <SearchIcon />
            <span className="hidden sm:inline">Cari produk</span>
          </Link>
          <AuthButton />
          <CartButton />
        </div>
      </div>

      <nav className="thin-scroll flex gap-5 overflow-x-auto border-t border-line px-4 py-2 text-sm md:hidden">
        {NAV.map(([label, href]) => (
          <Link key={href} href={href} className="whitespace-nowrap text-ink-soft hover:text-ink">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
