import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { fetchAllActiveProducts, fetchCategories } from "@/lib/catalog";

// Refresh harian — sitemap di-cache, tidak query DB tiap request.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/produk", "/tentang", "/cabang", "/kontak"].map(
    (p) => ({
      url: `${SITE_URL}${p || "/"}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: p === "" ? 1 : 0.7,
    }),
  );

  try {
    const [cats, products] = await Promise.all([fetchCategories(), fetchAllActiveProducts()]);
    const categoryRoutes: MetadataRoute.Sitemap = cats.map((c) => ({
      url: `${SITE_URL}/produk?kategori=${c.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));
    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/produk/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    // Jika DB tak terjangkau, tetap kembalikan rute statis.
    return staticRoutes;
  }
}
