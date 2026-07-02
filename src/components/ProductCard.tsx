import Link from "next/link";
import Image from "next/image";
import type { Category, Product, ProductStock } from "@/lib/types";
import { displayPrice, formatRupiah, titleCase } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WA_PRIMARY, waLink } from "@/lib/site";
import { productInquiryText } from "@/lib/wa";

interface Props {
  product: Product;
  category?: Category | null;
  stock: ProductStock;
}

export function ProductCard({ product, category, stock }: Props) {
  const hasStock = stock && stock.total > 0;
  const hasTiers = product.price_tiers.length > 0;
  const href = `/produk/${product.id}`;

  const price = displayPrice(product);
  const discounted =
    product.price_online != null && product.price > 0 && product.price_online < product.price;
  const off = discounted ? Math.round((1 - product.price_online! / product.price) * 100) : 0;

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
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-paper-2">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={`${product.name}${category ? " — " + titleCase(category.name) : ""} · grosir kemasan Akapack`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink-soft/40">
                <path
                  d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2V8.2ZM12 3v9m0 9v-9m9-3.8L12 12 3 8.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="px-3 text-center text-[10px] font-medium uppercase tracking-[0.08em] text-ink-soft/60">
                {category ? titleCase(category.name) : "Foto menyusul"}
              </span>
            </div>
          )}
          {discounted && (
            <span className="absolute left-0 top-2 rounded-r-md bg-discount px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              -{off}%
            </span>
          )}
          {hasTiers && (
            <span className="absolute right-2 top-2 rounded-md bg-indigo px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Grosir
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-[2.4rem] text-[13px] font-medium leading-snug text-ink transition-colors group-hover:text-indigo-ink">
            {product.name}
          </h3>
        </Link>

        <div className="mt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-ink">
              {formatRupiah(price)}
            </span>
            <span className="text-[11px] text-ink-soft">/ {product.unit ?? "pcs"}</span>
          </div>
          {discounted && (
            <span className="text-[11px] text-ink-soft line-through">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-1.5 pt-1 text-[11px]">
          {hasStock ? (
            <span className="inline-flex items-center gap-1 font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Stok ada
            </span>
          ) : (
            <span className="font-medium text-indigo-ink">Inden · tanya stok</span>
          )}
          {hasStock && (
            <span className="truncate text-ink-soft">
              · {stock.bandung} Bdg / {stock.garut} Grt
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-1.5">
          <AddToCartButton item={cartItem} />
          <a
            href={waLink(WA_PRIMARY, productInquiryText(product))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tanya via WhatsApp"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-success transition-colors hover:border-success/40 hover:bg-success/5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
