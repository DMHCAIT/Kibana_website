import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/server-data";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { productHref } from "@/lib/product-presentation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kibana.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/new-arrivals`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/cart`, changeFrequency: "never", priority: 0.2 },
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = SHOP_CATEGORIES.map((c) => ({
    url: `${SITE_URL}${c.href}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const variantEntries: MetadataRoute.Sitemap = products.flatMap((product) =>
    product.colorVariants
      .filter((variant) => variant.pageSlug)
      .map((variant) => ({
        url: `${SITE_URL}${productHref(product, variant)}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  );

  return [...staticEntries, ...productEntries, ...categoryEntries, ...variantEntries];
}
