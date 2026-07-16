import { pgTable, text, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";

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
  user: jsonb("user").$type<{ name: string; phone?: string; email?: string; id?: string } | null>(),
  items: jsonb("items")
    .$type<
      {
        productId: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
        color?: string;
        colorSlug?: string; // NEW: Store exact variant slug for precise reconstruction
      }[]
    >()
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
  email: text("email"), // nullable — legacy phone-only rows have no email
  phone: text("phone"), // nullable — kept for legacy/order data
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

// ── OTP sessions (phone → pending OTP verification) ───────────────────────────
export const otpSessions = pgTable("otp_sessions", {
  phone: text("phone").primaryKey(),
  // session ID returned by 2Factor.in (used to verify OTP via their API)
  twoFactorSessionId: text("two_factor_session_id"),
  // active OTP code (email login/signup)
  otp: text("otp"),
  // fallback OTP stored locally when no API key is configured (dev/test mode)
  devOtp: text("dev_otp"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── User login sessions (cookie-based, stored server-side) ────────────────────
export const userSessions = pgTable("user_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Contact messages ──────────────────────────────────────────────────────────
export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default(""),
  message: text("message").notNull().default(""),
  status: text("status").$type<"new" | "read" | "replied">().notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Media files (uploaded to Supabase Storage, tracked in DB) ─────────────────
export const mediaFiles = pgTable("media_files", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  bucket: text("bucket").notNull(),
  path: text("path").notNull(),
  type: text("type").$type<"image" | "video">().notNull().default("image"),
  size: integer("size").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── User Cart (persisted per user) ─────────────────────────────────────────────
export const userCart = pgTable("user_cart", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  variantId: text("variant_id"), // UNIQUE: productId + "-" + colorSlug (e.g., "p1-tan")
  color: text("color"), // LEGACY: kept for backward compat, will migrate to variantId
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── User Wishlist (persisted per user) ────────────────────────────────────────
export const userWishlist = pgTable("user_wishlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: text("product_id").notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
});

// Inferred types
export type ProductRow = typeof products.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type OtpSessionRow = typeof otpSessions.$inferSelect;
export type UserCartRow = typeof userCart.$inferSelect;
export type UserWishlistRow = typeof userWishlist.$inferSelect;
export type UserSessionRow = typeof userSessions.$inferSelect;
export type ContactMessageRow = typeof contactMessages.$inferSelect;
export type MediaFileRow = typeof mediaFiles.$inferSelect;
