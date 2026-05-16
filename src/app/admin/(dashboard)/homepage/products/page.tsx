import { getProducts, getSiteConfig } from "@/lib/server-data";
import { SectionProductsManager } from "@/components/admin/section-products-manager";

export default async function AdminHomepageProductsPage() {
  const products = await getProducts();
  const config = await getSiteConfig();
  return (
    <SectionProductsManager
      allProducts={products}
      initialAssignments={config.sectionProducts ?? {}}
    />
  );
}
