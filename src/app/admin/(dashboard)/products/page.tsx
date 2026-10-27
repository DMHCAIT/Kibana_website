import { getProducts } from "@/lib/server-data";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <ProductsClient initialProducts={products} />;
}
