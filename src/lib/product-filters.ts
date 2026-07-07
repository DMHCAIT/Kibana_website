import type { Product } from "@/types/product";

function collectProductText(product: Product): string {
  const chunks = [
    product.name,
    product.description,
    ...(product.features ?? []),
    ...Object.values(product.specs ?? {}),
    ...(product.colorVariants?.flatMap((variant) => [
      variant.productTitle,
      ...(variant.features ?? []),
      ...Object.values(variant.specs ?? {}),
    ]) ?? []),
  ];

  return chunks.filter(Boolean).join(" ").toLowerCase();
}

/** Products that mention "shoulder" anywhere in their product content. */
export function productHasShoulderKeyword(product: Product): boolean {
  return collectProductText(product).includes("shoulder");
}
