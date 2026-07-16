import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, userCart } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(client);

async function checkDatabase() {
  console.log("🔍 DATABASE VERIFICATION\n");

  try {
    // Check if variantId column exists in user_cart
    const columnsResult = await client`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name='user_cart' 
      ORDER BY ordinal_position
    `;

    console.log("✅ user_cart TABLE COLUMNS:");
    columnsResult.forEach((c: any) => {
      console.log(`   - ${c.column_name}: ${c.data_type}`);
    });

    // Check if products have variantIds
    const productList = await db.select().from(products).limit(1);

    if (productList.length > 0) {
      const product = productList[0];
      const variants = (product.colorVariants as any[]) || [];
      console.log("\n✅ SAMPLE PRODUCT VARIANTS:");
      console.log(`   Product: ${product.slug}`);
      console.log(`   Variants: ${variants.length}`);
      if (variants.length > 0) {
        const hasVariantId = variants[0].variantId ? "✅ YES" : "❌ NO";
        console.log(`   First variant has variantId? ${hasVariantId}`);
        console.log(`   Sample variant ID: ${variants[0].variantId || "missing"}`);
        console.log(
          `   All variants have IDs?`,
          variants.every((v: any) => v.variantId) ? "✅ YES" : "❌ NO",
        );
      }
    }

    // Check current cart items
    const cartItems = await db.select().from(userCart);
    console.log(`\n✅ CURRENT CART ITEMS: ${cartItems.length}`);
    if (cartItems.length > 0) {
      console.log("   Sample items:");
      cartItems.slice(0, 3).forEach((item: any, idx: number) => {
        console.log(
          `   [${idx + 1}] Product: ${item.productId}, VariantId: ${item.variantId || "(null)"}, Color: ${item.color || "(null)"}, Qty: ${item.quantity}`,
        );
      });
    }

    console.log("\n✅ Database verification complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
  }
}

checkDatabase();
