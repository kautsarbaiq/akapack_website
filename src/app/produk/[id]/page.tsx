import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  fetchProductById,
  fetchCategories,
  fetchStockFor,
  fetchProductsPage,
} from "@/lib/catalog";
import { displayPrice, formatRupiah, monogram, titleCase } from "@/lib/format";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductCard } from "@/components/ProductCard";

const getProduct = cache((id: string) => fetchProductById(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  return { title: p ? p.name : "Produk tidak ditemukan" };
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
  const color = category?.color || "#4f46e5";
  const price = displayPrice(product);

  // Produk terkait (kategori sama)
  const related = product.category_id
    ? (await fetchProductsPage({ categoryId: product.category_id, pageSize: 6 })).products
        .filter((p) => p.id !== id)
        .slice(0, 4)
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="font-mono text-xs text-ink-soft" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Beranda</Link>
        <span className="px-1.5">/</span>
        <Link href="/produk" className="hover:text-ink">Katalog</Link>
        {category && (
          <>
            <span className="px-1.5">/</span>
            <Link href={`/produk?kategori=${category.id}`} className="hover:text-ink">
              {titleCase(category.name)}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Visual */}
        <div className="relative aspect-square overflow-hidden border border-line">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: color }}>
              <span
                className="absolute right-2 top-0 font-mono text-[180px] font-medium leading-none"
                style={{ color: "rgba(255,255,255,0.3)" }}
                aria-hidden="true"
              >
                {monogram(product.name)}
              </span>
              {category && (
                <span className="absolute bottom-4 left-4 font-mono text-xs uppercase tracking-[0.12em] text-white/90">
                  {titleCase(category.name)}
                </span>
              )}
            </div>
          )}
          {product.sku && (
            <span className="absolute left-3 top-3 bg-white/85 px-2 py-1 font-mono text-xs text-ink">
              {product.sku}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          {category && (
            <Link
              href={`/produk?kategori=${category.id}`}
              className="font-mono text-xs uppercase tracking-[0.14em] text-indigo-ink hover:underline"
            >
              {titleCase(category.name)}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium">{formatRupiah(price)}</span>
            <span className="font-mono text-sm text-ink-soft">/ {product.unit ?? "pcs"}</span>
          </div>

          {/* Harga grosir bertingkat (muncul otomatis bila terisi) */}
          {product.price_tiers.length > 0 && (
            <div className="mt-5 border border-line">
              <div className="border-b border-line bg-paper-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
                Harga grosir
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {product.price_tiers.map((t, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="px-4 py-2 font-mono text-ink-soft">≥ {t.min_qty} {product.unit ?? "pcs"}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatRupiah(t.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stok per cabang */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Akapack Bandung", stock.bandung],
              ["Toko Kemasan Garut", stock.garut],
            ].map(([label, n]) => (
              <div key={label as string} className="border border-line bg-card px-4 py-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                  {label}
                </div>
                <div className="mt-1 font-display text-xl font-medium">
                  {(n as number) > 0 ? (
                    <>
                      {n} <span className="text-sm font-normal text-ink-soft">{product.unit ?? "pcs"}</span>
                    </>
                  ) : (
                    <span className="text-base text-indigo-ink">Inden</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <ProductPurchase item={cartItem} />
          </div>

          {product.description && (
            <div className="mt-6 border-t border-line pt-5">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">Deskripsi</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Produk terkait */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-medium tracking-tight">Produk serupa</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
