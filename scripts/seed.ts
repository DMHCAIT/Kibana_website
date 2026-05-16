/**
 * Seed script: reads existing JSON data files and inserts into Supabase.
 * Run once after setting up your Supabase project:
 *
 *   npx tsx scripts/seed.ts
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env.local (Supabase Transaction Pooler URL)
 *   - Schema pushed: npm run db:push
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  products as productsTable,
  categories as categoriesTable,
  orders as ordersTable,
  users as usersTable,
  siteConfig as siteConfigTable,
} from "../src/lib/db/schema";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8")) as T;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set. Add it to .env.local");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false, max: 1 });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding database from JSON files...\n");

  // ── Products ────────────────────────────────────────────────────────────────
  type RawProduct = {
    id: string; slug: string; name: string; description?: string;
    price: number; compareAtPrice?: number; image?: string; gallery?: string[];
    category?: string; gender?: string; isNew?: boolean; isBestSeller?: boolean;
    isTrending?: boolean; colors?: string[]; colorVariants?: unknown[];
    features?: string[]; specs?: Record<string, string>; rating?: number;
    reviewCount?: number; order?: number;
  };
  const products = readJson<RawProduct[]>("products.json");
  if (products.length) {
    await db
      .insert(productsTable)
      .values(
        products.map((p, i) => ({
          id: p.id,
          slug: p.slug,
          name: p.name ?? "",
          description: p.description ?? "",
          price: p.price ?? 0,
          compareAtPrice: p.compareAtPrice ?? null,
          image: p.image ?? "",
          gallery: p.gallery ?? [] as string[],
          category: p.category ?? "",
          gender: p.gender ?? "women",
          isNew: p.isNew ?? false,
          isBestSeller: p.isBestSeller ?? false,
          isTrending: p.isTrending ?? false,
          colors: p.colors ?? [] as string[],
          colorVariants: p.colorVariants ?? [] as unknown[],
          features: p.features ?? [] as string[],
          specs: p.specs ?? {} as Record<string, string>,
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          sortOrder: p.order ?? i + 1,
        }))
      )
      .onConflictDoNothing();
    console.log(`✅ Products: ${products.length} inserted`);
  }

  // ── Categories ────────────────────────────────────────────────────────────────
  type RawCat = { slug: string; name: string; image?: string; order?: number };
  const cats = readJson<RawCat[]>("categories.json");
  if (cats.length) {
    await db
      .insert(categoriesTable)
      .values(cats.map((c, i) => ({ slug: c.slug, name: c.name, image: c.image ?? "", sortOrder: c.order ?? i + 1 })))
      .onConflictDoNothing();
    console.log(`✅ Categories: ${cats.length} inserted`);
  }

  // ── Orders ────────────────────────────────────────────────────────────────────
  type RawOrder = {
    id: string; user?: unknown; items?: unknown; total?: number; placedAt?: string;
    status?: string; shippingAddress?: string; paymentMethod?: string;
    paymentStatus?: string; trackingId?: string | null;
  };
  const orders = readJson<RawOrder[]>("orders.json");
  if (orders.length) {
    await db
      .insert(ordersTable)
      .values(
        orders.map((o) => ({
          id: o.id,
          user: (o.user ?? null) as { name: string; phone: string; email?: string } | null,
          items: (o.items ?? []) as { productId: string; name: string; price: number; quantity: number; image: string; color?: string }[],
          total: o.total ?? 0,
          status: (o.status ?? "pending") as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
          shippingAddress: o.shippingAddress ?? null,
          paymentMethod: o.paymentMethod ?? null,
          paymentStatus: (o.paymentStatus ?? null) as "paid" | "pending" | "refunded" | null,
          trackingId: o.trackingId ?? null,
          placedAt: o.placedAt ? new Date(o.placedAt) : new Date(),
        }))
      )
      .onConflictDoNothing();
    console.log(`✅ Orders: ${orders.length} inserted`);
  }

  // ── Users ─────────────────────────────────────────────────────────────────────
  type RawUser = {
    id: string; name?: string; phone: string; email?: string;
    loginAt?: string; loginCount?: number; registeredAt?: string;
  };
  const users = readJson<RawUser[]>("users.json");
  if (users.length) {
    await db
      .insert(usersTable)
      .values(
        users.map((u) => ({
          id: u.id,
          name: u.name ?? "",
          phone: u.phone,
          email: u.email ?? null,
          loginAt: u.loginAt ? new Date(u.loginAt) : new Date(),
          loginCount: u.loginCount ?? 1,
          registeredAt: u.registeredAt ? new Date(u.registeredAt) : new Date(),
        }))
      )
      .onConflictDoNothing();
    console.log(`✅ Users: ${users.length} inserted`);
  }

  // ── Site Config ───────────────────────────────────────────────────────────────
  const config = readJson<unknown>("site-config.json");
  await db
    .insert(siteConfigTable)
    .values({ key: "config", value: config as Record<string, unknown>, updatedAt: new Date() })
    .onConflictDoNothing();
  console.log("✅ Site config inserted");

  console.log("\n🎉 Seeding complete!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
