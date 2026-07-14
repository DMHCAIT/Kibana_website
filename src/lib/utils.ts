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
 * Uses variant.productTitle (full name without color) and appends color
 * Format: "Full Product Name - [Color]" or just "Product Name" if no variant
 * Example: "Vistara Geometric Vegan Leather Tote Bag - [Mint Green]"
 */
export function getProductDisplayName(
  product: Product,
  variant?: Product["colorVariants"][number]
): string {
  if (!variant) return product.name;
  
  // Use variant's productTitle (full name) if available, otherwise fall back to product.name
  const baseTitle = variant.productTitle || product.name;
  
  // Remove duplicate color if productTitle already includes it
  const colorPattern = ` - \[${variant.color}\]`;
  if (baseTitle.endsWith(colorPattern)) {
    return baseTitle; // Already has color, return as-is
  }
  
  return `${baseTitle} - [${variant.color}]`;
}
