import type { Category, Product, ProductStock } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/home/SectionHeader";

interface Props {
  title: string;
  href?: string;
  hrefLabel?: string;
  products: Product[];
  stock: Record<string, ProductStock>;
  catMap: Map<string, Category>;
  light?: boolean;
}

/** Rail produk horizontal dengan judul + "lihat semua" (gaya marketplace). */
export function ProductRail({ title, href, hrefLabel = "Lihat semua", products, stock, catMap, light = false }: Props) {
  if (products.length === 0) return null;
  return (
    <section>
      <SectionHeader title={title} href={href} hrefLabel={hrefLabel} light={light} />
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div key={p.id} className="w-[158px] shrink-0 snap-start sm:w-[190px]">
            <ProductCard
              product={p}
              category={p.category_id ? catMap.get(p.category_id) : null}
              stock={stock[p.id]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
