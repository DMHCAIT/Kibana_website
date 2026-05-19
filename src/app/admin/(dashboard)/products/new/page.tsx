import { getCategories } from "@/lib/server-data";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function NewProductPage() {
  const categories = await withTimeout(getCategories(), 5000, []);
  return <ProductForm isNew categories={categories} />;
}
