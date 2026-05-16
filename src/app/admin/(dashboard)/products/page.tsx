import { getProducts } from "@/lib/server-data";
import { ProductsListClient } from "./products-list-client";

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <ProductsListClient initialProducts={products} />;
}

