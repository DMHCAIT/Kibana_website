import { NextResponse } from "next/server";
import { getProducts } from "@/lib/server-data";
import { getCachedProducts, setCachedProducts } from "@/lib/api/products-cache";

export async function GET() {
  const cached = getCachedProducts();

  // Return cached products if still fresh
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "private, max-age=30, must-revalidate",
        "CDN-Cache-Control": "max-age=30, must-revalidate",
        "X-Cache-Status": "HIT",
      },
    });
  }

  // Fetch fresh products
  const products = await getProducts();

  // Update cache
  setCachedProducts(products);

  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "private, max-age=30, must-revalidate",
      "CDN-Cache-Control": "max-age=30, must-revalidate",
      "X-Cache-Status": "MISS",
    },
  });
}
