import { notFound } from "next/navigation";
import { getProduct, getCategories } from "@/lib/server-data";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    withTimeout(getProduct(id), 2500, undefined),
    withTimeout(getCategories(), 2500, []),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories} />;
}
