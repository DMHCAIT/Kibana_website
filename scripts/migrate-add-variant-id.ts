/**
 * Direct SQL migration: Add variantId column to user_cart table
 * Run: npx tsx scripts/migrate-add-variant-id.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL is not set. Add it to .env.local");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false, max: 1 });

async function migrate() {
  try {
    console.log("🔧 Adding variantId column to user_cart table...\n");

    // Check if column already exists
    const result = await client`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_cart' AND column_name='variant_id'
      ) as exists
    `;

    if (result[0].exists) {
      console.log("✅ Column variant_id already exists");
    } else {
      // Add the column
      await client`
        ALTER TABLE user_cart 
        ADD COLUMN variant_id TEXT
      `;
      console.log("✅ Added variant_id column to user_cart table");
    }

    // Show table structure
    const columns = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name='user_cart' 
      ORDER BY ordinal_position
    `;

    console.log("\n📋 user_cart table structure:");
    columns.forEach((col) => {
      const nullable = col.is_nullable === "YES" ? "(nullable)" : "(not null)";
      console.log(`   ${col.column_name}: ${col.data_type} ${nullable}`);
    });

    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
