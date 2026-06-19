import Link from "next/link";
import type { Category, Product, ProductStock } from "@/lib/types";
import { displayPrice, formatRupiah, monogram, titleCase } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WA_PRIMARY, waLink } from "@/lib/site";
import { productInquiryText } from "@/lib/wa";

interface Props {
  product: Product;
  category?: Category | null;
  stock: ProductStock;
}

export function ProductCard({ product, category, stock }: Props) {
  const color = category?.color || "#4f46e5";
  const hasStock = stock && stock.total > 0;
  const hasTiers = product.price_tiers.length > 0;
  const href = `/produk/${product.id}`;

  const cartItem = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    unit: product.unit,
    price: displayPrice(product),
    image_url: product.image_url,
    color: category?.color ?? null,
  };

  return (
    <article className="group flex flex-col border border-line bg-card transition-colors hover:border-ink/25">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: color }}>
              <span
                className="absolute -right-1 top-1 font-mono text-[64px] font-medium leading-none"
                style={{ color: "rgba(255,255,255,0.32)" }}
                aria-hidden="true"
              >
                {monogram(product.name)}
              </span>
              {category && (
                <span className="absolute bottom-2 left-2 right-2 font-mono text-[10px] uppercase tracking-[0.1em] text-white/90">
                  {titleCase(category.name)}
                </span>
              )}
            </div>
          )}
          {product.sku && (
            <span className="absolute left-2 top-2 bg-white/85 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.04em] text-ink">
              {product.sku}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug transition-colors group-hover:text-indigo-ink">
            {product.name}
          </h3>
        </Link>

        <div className="font-mono text-xs text-ink-soft">per {product.unit ?? "pcs"}</div>

        <div className="text-lg font-medium tracking-tight">
          {formatRupiah(displayPrice(product))}
        </div>

        {hasTiers && (
          <span className="w-fit bg-indigo-wash px-1.5 py-0.5 font-mono text-[10px] text-indigo-ink">
            harga grosir tersedia
          </span>
        )}

        <div className="mt-auto border-t border-dashed border-line pt-2 font-mono text-[11px]">
          {hasStock ? (
            <span className="flex flex-wrap gap-x-3 text-ink-soft">
              <span>
                <b className="font-medium text-ink">{stock.bandung}</b> Bandung
              </span>
              <span>
                <b className="font-medium text-ink">{stock.garut}</b> Garut
              </span>
            </span>
          ) : (
            <span className="text-indigo-ink">Inden · tanya stok</span>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <AddToCartButton item={cartItem} />
          <a
            href={waLink(WA_PRIMARY, productInquiryText(product))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tanya via WhatsApp"
            className="flex h-8 w-8 items-center justify-center border border-line text-ink transition-colors hover:border-ink/30"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
