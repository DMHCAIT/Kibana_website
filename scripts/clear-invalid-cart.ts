/**
 * Clear old cart entries with null/invalid colors
 * Run: npx tsx scripts/clear-invalid-cart.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { userCart } from "../src/lib/db/schema";
import { eq, isNull } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set. Add it to .env.local");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false, max: 1 });
const db = drizzle(client);

async function clearInvalidCart() {
  try {
    console.log("🗑️  Clearing invalid cart entries (color=null, variantId=null)...\n");

    // Find and delete entries with both color and variantId null
    const invalidItems = await db.select().from(userCart).where(isNull(userCart.color));

    console.log(`Found ${invalidItems.length} items with null color`);

    if (invalidItems.length > 0) {
      await db.delete(userCart).where(isNull(userCart.color));
      console.log(`✅ Deleted ${invalidItems.length} invalid cart entries`);
    }

    // Show remaining cart items
    const remaining = await db.select().from(userCart);
    console.log(`\n📦 Remaining cart items: ${remaining.length}`);
    if (remaining.length > 0) {
      remaining.forEach((item) => {
        console.log(
          `   - User: ${item.userId}, Product: ${item.productId}, Color: ${item.color || "null"}, VariantId: ${item.variantId || "null"}`,
        );
      });
    }

    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearInvalidCart();
