import { getProducts } from "@/lib/server-data";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function AdminProductsPage() {
  const products = await withTimeout(getProducts(), 2500, []);
  return <ProductsClient initialProducts={products} />;
}

