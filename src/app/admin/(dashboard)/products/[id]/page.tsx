import { notFound } from "next/navigation";
import { getProduct, getCategories } from "@/lib/server-data";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories} />;
}
