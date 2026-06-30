import Link from "next/link";
import { CartButton } from "@/components/CartButton";
import { AuthButton } from "@/components/AuthButton";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderSearch } from "@/components/HeaderSearch";
import { CategoryMenu } from "@/components/CategoryMenu";
import { CATEGORY_GROUPS, OTHER_GROUP } from "@/lib/category-groups";

const MENU_GROUPS = [
  ...CATEGORY_GROUPS.map((g) => ({ slug: g.slug, label: g.label })),
  { slug: OTHER_GROUP.slug, label: OTHER_GROUP.label },
];

// Tautan cepat (nama pendek) di bar kategori.
const QUICK: [string, string][] = [
  ["mesin", "Mesin"],
  ["cup", "Cup & Gelas"],
  ["thinwall", "Thinwall"],
  ["botol", "Botol & Toples"],
  ["paperbox", "Paper Box"],
  ["kantong", "Plastik & Kresek"],
  ["papercup", "Paper Cup"],
  ["flexibel", "Pouch & Sachet"],
];

export function SiteHeader() {
  return (
    <>
      {/* Top utility bar */}
      <div className="bg-ink text-white">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-4 px-4 text-xs sm:px-6">
          <span className="truncate text-white/70">
            Grosir kemasan &amp; mesin pengemas — Bandung &amp; Garut
          </span>
          <div className="flex items-center gap-4">
            <Link href="/tentang" className="hidden text-white/70 hover:text-white sm:inline">
              Tentang
            </Link>
            <Link href="/cabang" className="text-white/70 hover:text-white">
              Lokasi Toko
            </Link>
            <Link href="/kontak" className="text-white/70 hover:text-white">
              Bantuan
            </Link>
            <span className="hidden font-medium text-orange sm:inline">
              Buka tiap hari 08.00–17.00
            </span>
          </div>
        </div>
      </div>

      {/* Sticky: header utama + bar kategori */}
      <header className="sticky top-0 z-40 bg-card shadow-card">
        {/* Header utama */}
        <div className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-6">
            <Link href="/" aria-label="Akapack — beranda" className="shrink-0">
              <BrandLogo className="h-9 w-auto sm:h-10" />
            </Link>

            <HeaderSearch className="mx-auto hidden w-full max-w-xl md:flex" />

            <div className="ml-auto flex items-center gap-2">
              <AuthButton />
              <CartButton />
            </div>
          </div>

          {/* Search mobile */}
          <div className="px-4 pb-2.5 md:hidden">
            <HeaderSearch />
          </div>
        </div>

        {/* Bar kategori */}
        <div className="border-b border-line">
          <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4 sm:px-6">
            <CategoryMenu groups={MENU_GROUPS} />
            <nav className="no-scrollbar flex items-center gap-0.5 overflow-x-auto">
              {QUICK.map(([slug, label]) => (
                <Link
                  key={slug}
                  href={`/produk/grup/${slug}`}
                  className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-paper-2 hover:text-indigo-ink"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <Link
              href="/produk"
              className="ml-auto hidden whitespace-nowrap text-sm font-semibold text-indigo-ink hover:underline sm:inline"
            >
              Semua Produk →
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
