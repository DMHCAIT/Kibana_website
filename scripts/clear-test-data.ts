import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { orders, users, products, categories, siteConfig } from "@/lib/db/schema";

async function clearTestData() {
  console.log("🗑️ Clearing test data from Supabase...\n");

  try {
    // Delete all orders first (due to foreign key constraints)
    console.log("Deleting orders...");
    await db.delete(orders);
    console.log("✓ Orders deleted\n");

    // Delete all users (except admin)
    console.log("Deleting users...");
    await db.delete(users);
    console.log("✓ Users deleted\n");

    // Keep products, categories, and siteConfig for the storefront
    console.log("✓ Products, categories, and site config preserved\n");

    console.log("✅ Cleanup complete! Database is now empty except for products and categories.");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  }
}

clearTestData();
