import type { Product } from "@/types/product";

export type ProductVariant = Product["colorVariants"][number];
export type ProductTag = "isNew" | "isBestSeller" | "isTrending";

export const HOMEPAGE_SECTIONS = [
  { tag: "isNew", label: "New Arrivals" },
  { tag: "isTrending", label: "Most Trending" },
  { tag: "isBestSeller", label: "Best Sellers" },
] as const;

export const DEFAULT_SHIPPING_RETURNS =
  "Free shipping on all orders above ₹999\nEasy returns within 7 days of delivery\nProducts must be unused and in original packaging";

export function productHref(product: Product, variant?: ProductVariant) {
  return variant?.pageSlug
    ? `/shop/${variant.pageSlug}`
    : `/shop/${product.slug}${variant ? `?color=${variant.slug}` : ""}`;
}

export function hasProductTag(product: Product, tag: ProductTag, variant?: ProductVariant) {
  return variant?.[tag] ?? product[tag] ?? false;
}

export function taggedProducts(products: Product[], tag: ProductTag): Product[] {
  return products.flatMap((product) => {
    if (!product.colorVariants?.length) return hasProductTag(product, tag) ? [product] : [];
    const variants = product.colorVariants.filter((variant) =>
      hasProductTag(product, tag, variant),
    );
    return variants.length
      ? [
          variants.length === product.colorVariants.length
            ? product
            : { ...product, colorVariants: variants },
        ]
      : [];
  });
}

export function homepageVariants(products: Product[], tag: ProductTag | "shopByCategory") {
  return products
    .flatMap((product) =>
      product.colorVariants.flatMap((variant) => {
        const rank = variant.homepageRanks?.[tag];
        return rank !== undefined &&
          Number.isInteger(rank) &&
          rank > 0 &&
          (tag === "shopByCategory" || hasProductTag(product, tag, variant))
          ? [{ product, variant, rank }]
          : [];
      }),
    )
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.product.id.localeCompare(b.product.id) ||
        a.variant.slug.localeCompare(b.variant.slug),
    )
    .slice(0, 4);
}

export function productInStock(product: Product, variant?: ProductVariant) {
  return product.inStock !== false && variant?.inStock !== false && variant?.stockQty !== 0;
}

export function orderedProductImages(image: string, gallery: string[] = []) {
  return Array.from(new Set([image, ...gallery].filter(Boolean)));
}

export function selectedProductVariant(product: Product, colorSlug?: string, variantId?: string) {
  const variant = colorSlug
    ? product.colorVariants.find((item) => item.slug === colorSlug)
    : variantId && variantId !== `${product.id}-default`
      ? product.colorVariants.find(
          (item) => item.variantId === variantId || `${product.id}-${item.slug}` === variantId,
        )
      : product.colorVariants[0];
  return variant;
}

export function unavailableProductSelection(
  product: Product,
  colorSlug?: string,
  variantId?: string,
) {
  return (
    !selectedProductVariant(product, colorSlug, variantId) &&
    Boolean(
      product.colorVariants.length ||
      colorSlug ||
      (variantId && variantId !== `${product.id}-default`),
    )
  );
}

export function orderItemFromCart(item: {
  product: Product;
  quantity: number;
  selectedColorSlug?: string;
  variantId?: string;
}) {
  const { product, quantity } = item;
  const variant = selectedProductVariant(product, item.selectedColorSlug, item.variantId);
  if (unavailableProductSelection(product, item.selectedColorSlug, item.variantId)) {
    throw new Error(
      `The selected colour of "${product.name}" is no longer available. Remove it from your cart and choose another colour.`,
    );
  }
  return {
    productId: product.id,
    variantId: variant?.variantId,
    name: variant?.productTitle || (variant ? `${product.name} - ${variant.color}` : product.name),
    price: variant?.price ?? product.price,
    quantity,
    image: variant ? variant.image : product.image,
    color: variant?.color,
    colorSlug: variant?.slug,
  };
}
