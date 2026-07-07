import { NextResponse } from "next/server";
import { getProducts } from "@/lib/server-data";
import type { Product } from "@/types/product";

// Cache products for 5 minutes (since they change infrequently)
let cachedProducts: Product[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const now = Date.now();
  
  // Return cached products if still fresh
  if (cachedProducts && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cachedProducts, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes
        "CDN-Cache-Control": "max-age=300",
      },
    });
  }

  // Fetch fresh products
  const products = await getProducts();
  
  // Update cache
  cachedProducts = products;
  cacheTime = now;

  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, max-age=300", // 5 minutes
      "CDN-Cache-Control": "max-age=300",
    },
  });
}

// Function to invalidate cache when products change (internal use only)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function invalidateProductsCache() {
  cachedProducts = null;
  cacheTime = 0;
}
