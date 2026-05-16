import {
  pgTable,
  text,
  integer,
  boolean,
  real,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  price: integer("price").notNull().default(0),
  compareAtPrice: integer("compare_at_price"),
  image: text("image").notNull().default(""),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  category: text("category").notNull().default(""),
  gender: text("gender").notNull().default("women"),
  isNew: boolean("is_new").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  inStock: boolean("in_stock").notNull().default(true),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  colorVariants: jsonb("color_variants").$type<unknown[]>().notNull().default([]),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
  video: text("video").default(""),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(999),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Categories ───────────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(999),
});

// ── Orders ────────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  user: jsonb("user").$type<{ name: string; phone: string; email?: string } | null>(),
  items: jsonb("items")
    .$type<{ productId: string; name: string; price: number; quantity: number; image: string; color?: string }[]>()
    .notNull()
    .default([]),
  total: integer("total").notNull().default(0),
  status: text("status")
    .$type<"pending" | "processing" | "shipped" | "delivered" | "cancelled">()
    .notNull()
    .default("pending"),
  shippingAddress: text("shipping_address"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").$type<"paid" | "pending" | "refunded">().default("pending"),
  trackingId: text("tracking_id"),
  placedAt: timestamp("placed_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Storefront users (login tracking) ─────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  phone: text("phone").notNull(),
  email: text("email"),
  loginAt: timestamp("login_at", { withTimezone: true }).defaultNow().notNull(),
  loginCount: integer("login_count").notNull().default(1),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Site config (single JSON blob, key = "config") ────────────────────────────
export const siteConfig = pgTable("site_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Inferred types
export type ProductRow = typeof products.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type UserRow = typeof users.$inferSelect;
