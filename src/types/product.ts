import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  image: z.string(),
  gallery: z.array(z.string()).default([]),
  category: z.enum([
    "tote-bag",
    "handbag",
    "laptop-bag",
    "sling-bag",
    "bucket-bag",
    "backpack",
    "wallet",
  ]),
  gender: z.enum(["men", "women", "unisex"]),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  colors: z.array(z.string()).default([]),
  colorVariants: z
    .array(z.object({ color: z.string(), image: z.string(), slug: z.string() }))
    .optional(),
  features: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.string()).default({}),
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
    "bucket-bag",
    "backpack",
    "wallet",
  ]),
  name: z.string(),
  image: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;
