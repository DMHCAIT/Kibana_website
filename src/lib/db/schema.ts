import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const genderEnum = pgEnum("gender", ["men", "women", "unisex"]);
export const categoryEnum = pgEnum("category", [
  "tote-bag",
  "laptop-bag",
  "sling-bag",
  "bucket-bag",
  "backpack",
  "wallet",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price_in_paise").notNull(),
  compareAtPrice: integer("compare_at_price_in_paise"),
  image: text("image").notNull(),
  gallery: text("gallery").array().notNull().default([]),
  category: categoryEnum("category").notNull(),
  gender: genderEnum("gender").notNull().default("women"),
  isNew: boolean("is_new").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  colors: text("colors").array().notNull().default([]),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"), // FK to auth.users
  email: text("email").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  subtotal: integer("subtotal_in_paise").notNull(),
  shipping: integer("shipping_in_paise").notNull().default(0),
  total: integer("total_in_paise").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: integer("price_at_purchase_in_paise").notNull(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
