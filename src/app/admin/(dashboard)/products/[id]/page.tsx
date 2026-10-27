import { notFound } from "next/navigation";
import { getProducts } from "@/lib/server-data";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { EnhancedProductForm } from "@/components/admin/enhanced-product-form";

// ⚡ Admin pages need real-time data, use short cache
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getProducts()).find((item) => item.id === id);

  if (!product) notFound();

  return <EnhancedProductForm product={product} categories={SHOP_CATEGORIES} />;
}
