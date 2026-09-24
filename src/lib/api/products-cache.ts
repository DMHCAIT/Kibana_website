import type { Product } from "@/types/product";

// Cache products for 30 seconds — matches server-side cache TTL for inventory updates
let cachedProducts: Product[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds

export function getCachedProducts(): Product[] | null {
  const now = Date.now();
  if (cachedProducts && now - cacheTime < CACHE_DURATION) {
    return cachedProducts;
  }
  return null;
}

export function setCachedProducts(products: Product[]): void {
  cachedProducts = products;
  cacheTime = Date.now();
}

export function invalidateProductsCache(): void {
  cachedProducts = null;
  cacheTime = 0;
}
