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
 * Format: "Product Name - [Color]" or just "Product Name" if no variant
 */
export function getProductDisplayName(
  product: Product,
  variant?: Product["colorVariants"][number]
): string {
  if (!variant) return product.name;
  return `${product.name} - [${variant.color}]`;
}
