import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPct(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Get the display name for a product with color variant
 * Returns variant.productTitle which already includes the complete formatted name with color
 * Format: "Full Product Name - [Color Name]"
 * Example: "Vistara Geometric Vegan Leather Tote Bag - [Milky Blue]"
 */
export function getProductDisplayName(
  product: Product,
  variant?: Product["colorVariants"][number],
): string {
  if (!variant) return product.name;

  // Return the full variant product title which includes the color
  // e.g., "Halo Mini Chain Sling Bag in Vegan Leather - Forest Green"
  // This shows exactly which color variant was added to cart/checkout/orders
  return variant.productTitle || product.name;
}
