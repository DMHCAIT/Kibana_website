/**
 * Migration script: Add variantId to all product colorVariants
 * Run: node scripts/add-variant-ids.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "../src/data/products.json");

console.log("📝 Adding variantId to all product variants...\n");

// Read products.json
const products = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

// Process each product
let updatedCount = 0;
let variantCount = 0;

products.forEach((product) => {
  if (product.colorVariants && Array.isArray(product.colorVariants)) {
    let hasUpdate = false;
    
    product.colorVariants.forEach((variant) => {
      // Only add if variantId doesn't already exist
      if (!variant.variantId) {
        variant.variantId = `${product.id}-${variant.slug}`;
        hasUpdate = true;
        variantCount++;
        console.log(`  ✓ ${product.id} - ${variant.slug} → ${variant.variantId}`);
      }
    });
    
    if (hasUpdate) {
      updatedCount++;
    }
  }
});

// Write back to file
fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2) + "\n");

console.log(`\n✅ Done!`);
console.log(`   ${updatedCount} products updated`);
console.log(`   ${variantCount} variant IDs added`);
