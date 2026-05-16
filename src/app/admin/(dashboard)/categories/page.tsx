import { getCategories, getProducts } from "@/lib/server-data";
import { CategoriesClient } from "./categories-client";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const productCounts: Record<string, number> = {};
  for (const p of products) {
    productCounts[p.category] = (productCounts[p.category] ?? 0) + 1;
  }

  return <CategoriesClient initialCategories={categories} productCounts={productCounts} />;
}
