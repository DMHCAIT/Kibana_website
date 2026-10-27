import type { Product } from "@/types/product";

export function pickDefaultProductImage(primary?: string, gallery: string[] = []): string {
  return primary || gallery.find(Boolean) || "/extracted/img-060.jpg";
}

export function getShopDisplayImage(
  product: Product,
  variant: Product["colorVariants"][number],
): string {
  return pickDefaultProductImage(
    variant.image,
    variant.gallery?.length ? variant.gallery : [product.image],
  );
}
