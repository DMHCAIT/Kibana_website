import { notFound } from "next/navigation";
import { getProduct, getCategories } from "@/lib/server-data";
import { EnhancedProductForm } from "@/components/admin/enhanced-product-form";

// ⚡ Admin pages need real-time data, use short cache
export const revalidate = 5;

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    withTimeout(getProduct(id), 2000, undefined),
    withTimeout(getCategories(), 1500, []),
  ]);

  if (!product) notFound();

  return <EnhancedProductForm product={product} categories={categories} />;
}
