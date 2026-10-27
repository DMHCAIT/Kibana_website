import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { EnhancedProductForm } from "@/components/admin/enhanced-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  return <EnhancedProductForm isNew categories={SHOP_CATEGORIES} />;
}
