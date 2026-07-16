/**
 * Seed homepage data (categories, site config) to database.
 * This makes the homepage design stable and consistent across environments.
 *
 * Run via: npm run seed:homepage
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
import { categories as categoriesTable } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8")) as T;
}

const connectionString = process.env.DATABASE_URL;

async function seed() {
  if (!connectionString) {
    console.log("⚠️  DATABASE_URL not set. Using local data files as canonical source.\n");
    console.log("📌 Categories are being read from: src/data/categories.json\n");

    const categories =
      readJson<Array<{ slug: string; name: string; image: string; order: number }>>(
        "categories.json",
      );
    console.log("📋 Categories (canonical order):");
    categories.forEach((cat) => {
      console.log(`  ${cat.order}. ${cat.name} (${cat.slug})`);
    });
    console.log("\n✅ Homepage data is stable and version-controlled.\n");
    process.exit(0);
  }

  console.log("🌱 Seeding homepage data to database...\n");

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

    console.log("📋 Categories to seed:");
    categories.forEach((cat) => {
      console.log(`  ${cat.order}. ${cat.name} (${cat.slug}) - ${cat.image}`);
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
      console.log(`  ✅ ${cat.name}`);
    }

    console.log("\n✨ Homepage data seeding complete!\n");
    console.log("📌 These categories are now persisted in the database:");
    console.log("   • Will remain stable across server restarts");
    console.log("   • Will sync with src/data/categories.json on each seed");
    console.log("   • Use: npm run seed:homepage (whenever you update homepage design)\n");

    await client.end();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
