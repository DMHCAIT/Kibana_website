#!/usr/bin/env node

import postgres from "postgres";

const sql = postgres(
  "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  { ssl: "require" }
);

async function test() {
  console.log("🔍 Checking Products Table Schema & Data\n");

  try {
    // Get table structure
    console.log("📋 TABLE STRUCTURE:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`  ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | nullable: ${col.is_nullable}`);
    });

    // Get first product and show all values
    console.log("\n📦 SAMPLE PRODUCT DATA:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const products = await sql`SELECT * FROM products LIMIT 1`;
    
    if (products.length === 0) {
      console.log("❌ No products in database");
      await sql.end();
      return;
    }

    const product = products[0];
    console.log(`Product ID: ${product.id}`);
    console.log(`Product Name: ${product.name}`);
    console.log(`\nAll columns in this product:`);
    
    Object.entries(product).forEach(([key, value]) => {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const display = valueStr.length > 60 ? valueStr.substring(0, 60) + '...' : valueStr;
      console.log(`  ${key.padEnd(25)} = ${display}`);
    });

    // Check specifically for color/variant related fields
    console.log("\n🎨 COLOR VARIANT FIELDS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const colorFields = Object.keys(product).filter(k => 
      k.includes('color') || k.includes('variant') || k.includes('Color') || k.includes('Variant')
    );
    
    if (colorFields.length === 0) {
      console.log("❌ No color/variant fields found!");
    } else {
      colorFields.forEach(field => {
        console.log(`  ${field}: ${JSON.stringify(product[field])}`);
      });
    }

    // Count products and check how many have colorVariants
    console.log("\n📊 STATISTICS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const stats = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN "colorVariants" IS NOT NULL THEN 1 END) as has_colorVariants,
        COUNT(CASE WHEN "colors" IS NOT NULL THEN 1 END) as has_colors
      FROM products
    `;
    
    console.log(`Total products: ${stats[0].total_products}`);
    console.log(`Products with colorVariants: ${stats[0].has_colorVariants}`);
    console.log(`Products with colors: ${stats[0].has_colors}`);

    await sql.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sql.end();
    process.exit(1);
  }
}

test();
