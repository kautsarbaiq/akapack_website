import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  fetchProductById,
  fetchCategories,
  fetchStockFor,
  fetchProductsPage,
} from "@/lib/catalog";
import { displayPrice, formatRupiah, titleCase } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductCard } from "@/components/ProductCard";

// ISR: tiap halaman produk di-cache 1 jam (render sekali, segarkan stok/harga).
export const revalidate = 3600;

const getProduct = cache((id: string) => fetchProductById(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) {
    return { title: "Produk tidak ditemukan", robots: { index: false, follow: false } };
  }
  const price = formatRupiah(displayPrice(p));
  const unit = p.unit ?? "pcs";
  const description = `${p.name} — harga grosir ${price}/${unit} di Akapack. Stok nyata cabang Bandung & Garut, pesan cepat via WhatsApp.`;
  const images = p.image_url ? [{ url: p.image_url }] : undefined;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/produk/${id}` },
    openGraph: {
      type: "website",
      siteName: "Akapack",
      locale: "id_ID",
      title: `${p.name} · Akapack`,
      description,
      url: `/produk/${id}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: p.name,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [categories, stockMap] = await Promise.all([fetchCategories(), fetchStockFor([id])]);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const category = product.category_id ? catMap.get(product.category_id) : null;
  const stock = stockMap[id] ?? { bandung: 0, garut: 0, total: 0 };
  const price = displayPrice(product);
  const discounted =
    product.price_online != null && product.price > 0 && product.price_online < product.price;
  const off = discounted ? Math.round((1 - product.price_online! / product.price) * 100) : 0;

  // Produk terkait (kategori sama, utamakan berfoto)
  const related = product.category_id
    ? (await fetchProductsPage({ categoryId: product.category_id, pageSize: 8, photoFirst: true })).products
        .filter((p) => p.id !== id)
        .slice(0, 6)
    : [];
  const relStock = related.length ? await fetchStockFor(related.map((r) => r.id)) : {};

  const cartItem = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    unit: product.unit,
    price,
    image_url: product.image_url,
    color: category?.color ?? null,
  };

  // Structured data: Product + Offer (rich result harga & ketersediaan).
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/produk/${id}#product`,
    name: product.name,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.barcode ? { gtin: product.barcode } : {}),
    ...(product.image_url ? { image: product.image_url } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(category ? { category: titleCase(category.name) } : {}),
    brand: { "@type": "Brand", name: "Akapack" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produk/${id}`,
      priceCurrency: "IDR",
      price,
      availability:
        stock.total > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#org` },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Katalog", item: `${SITE_URL}/produk` },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: titleCase(category.name),
              item: `${SITE_URL}/produk?kategori=${category.id}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: product.name,
        item: `${SITE_URL}/produk/${id}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-indigo-ink">Beranda</Link>
        <span className="px-1.5">/</span>
        <Link href="/produk" className="hover:text-indigo-ink">Katalog</Link>
        {category && (
          <>
            <span className="px-1.5">/</span>
            <Link href={`/produk?kategori=${category.id}`} className="hover:text-indigo-ink">
              {titleCase(category.name)}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Visual */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={`${product.name}${category ? " — " + titleCase(category.name) : ""} · grosir kemasan Akapack`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper-2">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink-soft/35">
                <path
                  d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2V8.2ZM12 3v9m0 9v-9m9-3.8L12 12 3 8.2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-medium uppercase tracking-[0.1em] text-ink-soft/60">
                Foto menyusul — tanya via WhatsApp
              </span>
            </div>
          )}
          {discounted && (
            <span className="absolute left-0 top-4 rounded-r-lg bg-discount px-2.5 py-1 text-sm font-bold text-white shadow-sm">
              -{off}%
            </span>
          )}
          {product.sku && (
            <span className="absolute left-3 bottom-3 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-ink-soft shadow-sm">
              SKU {product.sku}
            </span>
          )}
        </div>

        {/* Info + panel beli */}
        <div>
          {category && (
            <Link
              href={`/produk?kategori=${category.id}`}
              className="inline-block rounded-full bg-indigo-wash px-3 py-1 text-xs font-semibold text-indigo-ink hover:opacity-90"
            >
              {titleCase(category.name)}
            </Link>
          )}
          <h1 className="mt-2.5 text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 rounded-xl bg-paper-2 px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="text-3xl font-extrabold tracking-tight text-indigo-ink">
                {formatRupiah(price)}
              </span>
              <span className="text-sm text-ink-soft">/ {product.unit ?? "pcs"}</span>
              {discounted && (
                <span className="text-sm text-ink-soft line-through">{formatRupiah(product.price)}</span>
              )}
            </div>
          </div>

          {/* Harga grosir bertingkat (muncul otomatis bila terisi) */}
          {product.price_tiers.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <div className="border-b border-line bg-indigo-wash px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-indigo-ink">
                Harga grosir — makin banyak makin murah
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {product.price_tiers.map((t, i) => (
                    <tr key={i} className="border-b border-line bg-card last:border-0">
                      <td className="px-4 py-2 text-ink-soft">≥ {t.min_qty} {product.unit ?? "pcs"}</td>
                      <td className="px-4 py-2 text-right font-bold">{formatRupiah(t.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stok per cabang */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["Bandung", stock.bandung],
              ["Garut", stock.garut],
            ].map(([label, n]) => (
              <div key={label as string} className="rounded-xl border border-line bg-card px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  Stok {label}
                </div>
                <div className="mt-0.5 text-lg font-extrabold">
                  {(n as number) > 0 ? (
                    <span className="text-success">
                      {n} <span className="text-xs font-medium text-ink-soft">{product.unit ?? "pcs"}</span>
                    </span>
                  ) : (
                    <span className="text-base font-semibold text-indigo-ink">Inden</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <ProductPurchase item={cartItem} />
          </div>

          {/* Trust strip */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-ink-soft">
            <div className="rounded-lg bg-paper-2 px-2 py-2.5">✓ Harga grosir</div>
            <div className="rounded-lg bg-paper-2 px-2 py-2.5">✓ Stok 2 cabang</div>
            <div className="rounded-lg bg-paper-2 px-2 py-2.5">✓ Dibantu via WA</div>
          </div>

          {product.description && (
            <div className="mt-5 rounded-xl border border-line bg-card p-4">
              <h2 className="mb-2 text-sm font-bold text-ink">Deskripsi</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Produk terkait */}
      {related.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-indigo" />
            <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">Produk serupa</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={p.category_id ? catMap.get(p.category_id) : null}
                stock={relStock[p.id] ?? { bandung: 0, garut: 0, total: 0 }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
