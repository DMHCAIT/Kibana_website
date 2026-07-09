import { getCategories } from "@/lib/server-data";
import { EnhancedProductForm } from "@/components/admin/enhanced-product-form";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function NewProductPage() {
  const categories = await withTimeout(getCategories(), 2500, []);
  return <EnhancedProductForm isNew categories={categories} />;
}

