import { z } from "zod";
import { ProductSchema, type Product } from "@/types/product";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { orderedProductImages } from "@/lib/product-presentation";

const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");
export const AdminProductSchema = ProductSchema.extend({
  id: z.string().min(1),
  slug,
  name: z.string().trim().min(1, "Product name is required."),
  colorVariants: ProductSchema.shape.colorVariants
    .removeDefault()
    .min(1, "Add at least one colour variant."),
  category: ProductSchema.shape.category.refine(
    (value) => SHOP_CATEGORIES.some((category) => category.slug === value),
    "Choose one of the eight storefront categories.",
  ),
  order: z.number().int().optional(),
}).superRefine((product, context) => {
  const colors = new Set<string>();
  const ids = new Set<string>();
  const pages = new Set([product.slug]);
  for (const [index, variant] of product.colorVariants.entries()) {
    if (!variant.variantId || ids.has(variant.variantId))
      context.addIssue({
        code: "custom",
        path: ["colorVariants", index, "variantId"],
        message: "Each colour needs a unique variant ID.",
      });
    ids.add(variant.variantId);
    if (!variant.productTitle?.trim())
      context.addIssue({
        code: "custom",
        path: ["colorVariants", index, "productTitle"],
        message: "Enter the product name for this colour.",
      });
    if (!variant.price || !Number.isInteger(variant.price) || variant.price <= 0)
      context.addIssue({
        code: "custom",
        path: ["colorVariants", index, "price"],
        message: "Enter a positive whole-number price for this colour.",
      });
    if (!variant.color.trim())
      context.addIssue({
        code: "custom",
        path: ["colorVariants", index, "color"],
        message: "Colour name is required.",
      });
    if (!slug.safeParse(variant.slug).success || colors.has(variant.slug)) {
      context.addIssue({
        code: "custom",
        path: ["colorVariants", index, "slug"],
        message: "Each colour needs a unique valid colour key.",
      });
    }
    colors.add(variant.slug);
    if (
      variant.pageSlug &&
      (!slug.safeParse(variant.pageSlug).success || pages.has(variant.pageSlug))
    ) {
      context.addIssue({
        code: "custom",
        path: ["colorVariants", index, "pageSlug"],
        message: "Each variant page slug must be valid and unique.",
      });
    }
    if (variant.pageSlug) pages.add(variant.pageSlug);
    if (!variant.image)
      context.addIssue({
        code: "custom",
        path: ["colorVariants", index, "image"],
        message: "Each colour needs an image.",
      });
  }
});

export function initializeProductVariants(product: Product): Product {
  return {
    ...product,
    colorVariants: product.colorVariants.map((variant) => ({
      ...variant,
      productTitle: variant.productTitle ?? `${product.name} - ${variant.color}`,
      price: variant.price ?? product.price,
      compareAtPrice:
        variant.price === undefined
          ? (variant.compareAtPrice ?? product.compareAtPrice)
          : variant.compareAtPrice,
      description: variant.description ?? product.description,
      features: variant.features ?? product.features,
      specs: variant.specs ?? product.specs,
      shippingReturns: variant.shippingReturns ?? product.shippingReturns,
      gallery: variant.gallery ?? (variant.image === product.image ? product.gallery : []),
    })),
  };
}

export function normalizeProductImages(product: Product): Product {
  const colorVariants = product.colorVariants.map((variant) => ({
    ...variant,
    displayImage: undefined,
    gallery: orderedProductImages(variant.image, variant.gallery),
  }));
  const first = colorVariants[0];
  return {
    ...product,
    displayImage: undefined,
    image: first?.image ?? product.image,
    gallery: first?.gallery ?? orderedProductImages(product.image, product.gallery),
    description: first?.description ?? product.description,
    features: first?.features ?? product.features,
    specs: first?.specs ?? product.specs,
    shippingReturns: first?.shippingReturns ?? product.shippingReturns,
    price: first?.price ?? product.price,
    compareAtPrice: first?.compareAtPrice,
    colors: colorVariants.map((variant) => variant.hex || variant.color),
    colorVariants,
  };
}

export function assertUniqueProductSlugs(
  product: Product,
  catalog: {
    id: string;
    slug: string;
    colorVariants: { pageSlug?: string }[];
  }[],
) {
  const desired = new Set([
    product.slug,
    ...product.colorVariants.map((variant) => variant.pageSlug).filter(Boolean),
  ]);
  for (const other of catalog) {
    if (other.id === product.id) continue;
    for (const value of [other.slug, ...other.colorVariants.map((variant) => variant.pageSlug)]) {
      if (value && desired.has(value))
        throw new Error(`The page slug "${value}" is already used by another product.`);
    }
  }
}
