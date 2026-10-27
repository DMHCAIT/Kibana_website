import { z } from "zod";

export const HomepageRanksSchema = z.object({
  isNew: z.number().int().positive().optional(),
  isBestSeller: z.number().int().positive().optional(),
  isTrending: z.number().int().positive().optional(),
  shopByCategory: z.number().int().positive().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  shippingReturns: z.string().optional(),
  inStock: z.boolean().optional(),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  image: z.string(),
  displayImage: z.string().optional(), // New: separate display image for cards
  gallery: z.array(z.string()).default([]),
  category: z.enum([
    "tote-bag",
    "handbag",
    "shoulder-bag",
    "laptop-bag",
    "sling-bag",
    "clutch",
    "backpack",
    "wallet",
    "duffle-bag",
  ]),
  gender: z.enum(["men", "women", "unisex"]),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  colors: z.array(z.string()).default([]),
  colorVariants: z
    .array(
      z.object({
        variantId: z.string(), // UNIQUE: productId + "-" + slug (e.g., "p1-tan")
        color: z.string(),
        hex: z.string().optional(),
        slug: z.string(),
        pageSlug: z.string().optional(),
        isNew: z.boolean().optional(),
        isBestSeller: z.boolean().optional(),
        isTrending: z.boolean().optional(),
        homepageRanks: HomepageRanksSchema.optional(),
        image: z.string(),
        displayImage: z.string().optional(), // New: separate display image for cards
        gallery: z.array(z.string()).optional(),
        productTitle: z.string().optional(),
        stockQty: z.number().int().nonnegative().optional(),
        price: z.number().int().positive().optional(),
        compareAtPrice: z.number().int().positive().optional(),
        inStock: z.boolean().optional(),
        // Per-color product page content overrides
        description: z.string().optional(),
        shippingReturns: z.string().optional(),
        features: z.array(z.string()).optional(),
        specs: z.record(z.string(), z.string()).optional(),
      }),
    )
    .default([]),
  features: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.string()).default({}),
  video: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().nonnegative().default(0),
});

export type Product = z.infer<typeof ProductSchema>;

export const CategorySchema = z.object({
  slug: z.enum([
    "tote-bag",
    "handbag",
    "laptop-bag",
    "sling-bag",
    "shoulder-bag",
    "clutch",
    "backpack",
    "wallet",
    "duffle-bag",
  ]),
  name: z.string(),
  image: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;
