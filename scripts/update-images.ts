/**
 * Update image paths in the database to use mobileversion_images folder.
 * Run with:  npx tsx scripts/update-images.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import {
  products as productsTable,
  categories as categoriesTable,
  siteConfig as siteConfigTable,
} from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false, max: 1 });
const db = drizzle(client);

// ── Category images ───────────────────────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
  "tote-bag":   "/mv/cat-5.jpeg",  // Totebag.jpeg
  "laptop-bag": "/mv/cat-3.jpeg",  // Laptopbag.jpeg
  "sling-bag":  "/mv/cat-4.jpeg",  // sling.jpeg
  "clutch":     "/mv/cat-2.jpeg",  // Clutch.jpeg
  "backpack":   "/mv/cat-1.jpeg",  // backpack.jpeg
  "wallet":     "/mv/cat-6.jpeg",  // Wallet.jpeg
};

// ── New Arrivals product images ───────────────────────────────────────────────
const PRODUCT_IMAGES: Record<string, string> = {
  "p11": "/mv/new-3.jpg",  // Halo Mini
  "p12": "/mv/new-4.jpg",  // Orwyn Backpack
  "p13": "/mv/new-2.jpg",  // Crescent Sling Bag
  "p14": "/mv/new-1.jpg",  // Business Laptop Briefcase
};

async function run() {
  console.log("🔄 Updating images in database...\n");

  // ── Update category images ────────────────────────────────────────────────
  for (const [slug, image] of Object.entries(CATEGORY_IMAGES)) {
    await db
      .update(categoriesTable)
      .set({ image })
      .where(eq(categoriesTable.slug, slug));
    console.log(`✅ Category [${slug}] → ${image}`);
  }

  // ── Update new arrivals product images ────────────────────────────────────
  for (const [id, image] of Object.entries(PRODUCT_IMAGES)) {
    await db
      .update(productsTable)
      .set({ image })
      .where(eq(productsTable.id, id));
    console.log(`✅ Product  [${id}] → ${image}`);
  }

  // ── Update Best Sellers site config ───────────────────────────────────────
  // Read existing config first
  const [existing] = await db.select().from(siteConfigTable).where(eq(siteConfigTable.key, "config"));
  if (existing) {
    const data = existing.value as Record<string, unknown>;
    const sectionContent = (data.sectionContent ?? {}) as Record<string, unknown>;
    const bestSellers = (sectionContent.bestSellers ?? {}) as Record<string, unknown>;

    const updated = {
      ...data,
      sectionContent: {
        ...sectionContent,
        bestSellers: {
          ...bestSellers,
          leftImage: "/mv/best-seller-banner.jpeg",
          rightImage: "/mv/best-seller-banner.jpeg",
        },
      },
    };

    await db
      .update(siteConfigTable)
      .set({ value: updated })
      .where(eq(siteConfigTable.key, "config"));
    console.log("✅ Best Sellers banner → /mv/best-seller-banner.jpeg");
  } else {
    console.log("⚠️  Site config not found in DB — Best Sellers will use the code default.");
  }

  console.log("\n✨ Done! All images updated.");
  await client.end();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
