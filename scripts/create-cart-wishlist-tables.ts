import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });

async function main() {
  console.log("Creating cart and wishlist tables...\n");

  await sql`
    CREATE TABLE IF NOT EXISTS "user_cart" (
      "id"          text PRIMARY KEY NOT NULL,
      "user_id"     text NOT NULL,
      "product_id"  text NOT NULL,
      "quantity"    integer NOT NULL DEFAULT 1,
      "color"       text,
      "added_at"    timestamptz NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ user_cart created (or already exists)");

  // Create index for fast lookup by user_id
  await sql`
    CREATE INDEX IF NOT EXISTS user_cart_user_id_idx ON user_cart (user_id)
  `;
  console.log("✓ user_cart_user_id_idx created");

  // Create unique constraint so user can't have duplicate product in cart
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS user_cart_user_product_unique 
    ON user_cart (user_id, product_id, COALESCE(color, ''))
  `;
  console.log("✓ user_cart unique constraint created");

  await sql`
    CREATE TABLE IF NOT EXISTS "user_wishlist" (
      "id"          text PRIMARY KEY NOT NULL,
      "user_id"     text NOT NULL,
      "product_id"  text NOT NULL,
      "added_at"    timestamptz NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ user_wishlist created (or already exists)");

  // Create index for fast lookup by user_id
  await sql`
    CREATE INDEX IF NOT EXISTS user_wishlist_user_id_idx ON user_wishlist (user_id)
  `;
  console.log("✓ user_wishlist_user_id_idx created");

  // Create unique constraint so user can't have duplicate product in wishlist
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS user_wishlist_user_product_unique 
    ON user_wishlist (user_id, product_id)
  `;
  console.log("✓ user_wishlist unique constraint created");

  await sql.end();
  console.log("\n✅ Cart and wishlist tables ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
