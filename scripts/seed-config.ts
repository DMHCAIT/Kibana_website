/**
 * Comprehensive seed script for homepage and shop page data.
 * This makes the entire site design stable and consistent across environments.
 *
 * Run via: npm run seed:config
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env.local (Supabase Transaction Pooler URL)
 *   - Schema pushed: npm run db:push
 *
 * What it seeds:
 *   - Categories (homepage category order)
 *   - Products (shop page product display order)
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories as categoriesTable, products as productsTable } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8")) as T;
}

const connectionString = process.env.DATABASE_URL;

async function seed() {
  if (!connectionString) {
    console.log("⚠️  DATABASE_URL not set. Using local data files as canonical source.\n");

    const categories =
      readJson<Array<{ slug: string; name: string; image: string; order: number }>>(
        "categories.json",
      );
    console.log("📌 Homepage categories (canonical order):");
    categories.forEach((cat) => {
      console.log(`  ${cat.order}. ${cat.name}`);
    });

    const products = readJson<Array<{ id: string; name: string }>>("products.json");
    console.log(`\n📌 Shop products: ${products.length} products in canonical order\n`);
    console.log("✅ Site configuration is stable and version-controlled.\n");
    process.exit(0);
  }

  console.log("🌱 Seeding site configuration to database...\n");

  const client = postgres(connectionString, { prepare: false, max: 1 });
  const db = drizzle(client);

  try {
    // ── Categories ──────────────────────────────────────────────────────────────
    type CategoryData = {
      slug: string;
      name: string;
      image: string;
      order: number;
    };

    const categories = readJson<CategoryData[]>("categories.json");

    console.log("📋 Seeding categories:");
    categories.forEach((cat) => {
      console.log(`  ${cat.order}. ${cat.name}`);
    });
    console.log("");

    for (const cat of categories) {
      await db
        .insert(categoriesTable)
        .values({
          slug: cat.slug,
          name: cat.name,
          image: cat.image,
          sortOrder: cat.order,
        })
        .onConflictDoUpdate({
          target: categoriesTable.slug,
          set: {
            name: cat.name,
            image: cat.image,
            sortOrder: cat.order,
          },
        });
    }
    console.log("✅ Categories seeded\n");

    // ── Products ────────────────────────────────────────────────────────────────
    type ProductData = any;

    const products = readJson<ProductData[]>("products.json");

    console.log(`📋 Seeding products (${products.length} items)...`);
    let seedCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const row = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description ?? "",
        price: product.price ?? 0,
        compareAtPrice: product.compareAtPrice ?? null,
        image: product.image ?? "",
        gallery: product.gallery ?? [],
        category: product.category ?? "uncategorized",
        gender: product.gender ?? "unisex",
        isNew: product.isNew ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isTrending: product.isTrending ?? false,
        inStock: product.inStock ?? true,
        colors: product.colors ?? [],
        colorVariants: product.colorVariants ?? [],
        features: product.features ?? [],
        specs: product.specs ?? {},
        video: product.video ?? null,
        rating: product.rating ?? 0,
        reviewCount: product.reviewCount ?? 0,
        sortOrder: i + 1, // Maintain canonical order from products.json
        updatedAt: new Date(),
      };

      await db
        .insert(productsTable)
        .values(row)
        .onConflictDoUpdate({
          target: productsTable.id,
          set: { sortOrder: i + 1, updatedAt: new Date() },
        });

      seedCount++;
      if ((i + 1) % 10 === 0) {
        console.log(`  ✓ ${i + 1}/${products.length}`);
      }
    }

    console.log(`✅ ${seedCount} products seeded\n`);

    console.log("✨ Site configuration seeding complete!\n");
    console.log("📌 Site is now standardized:");
    console.log("   • Homepage categories - persisted to database");
    console.log("   • Shop product order - persisted to database");
    console.log("   • All content stable across server restarts");
    console.log(`   • Use: npm run seed:config (whenever you update site design)\n`);

    await client.end();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
