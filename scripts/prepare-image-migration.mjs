#!/usr/bin/env node
/**
 * Simplified image migration script
 * Uploads images to Supabase and updates products database
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_JSON = path.join(__dirname, "..", "src", "data", "products.json");
const PUBLIC_DIR = path.join(__dirname, "..", "public");

async function main() {
  console.log("=== Image Migration to Supabase ===\n");

  // Step 1: Read products.json
  console.log("📂 Reading products.json...");
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8"));
  
  console.log(`Found ${productsData.length} products\n`);

  // Step 2: Extract all unique image paths
  const imagePaths = new Set();
  
  for (const product of productsData) {
    if (product.image) imagePaths.add(product.image);
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach(img => imagePaths.add(img));
    }
    if (product.colorVariants && Array.isArray(product.colorVariants)) {
      product.colorVariants.forEach(variant => {
        if (variant.image) imagePaths.add(variant.image);
        if (variant.gallery && Array.isArray(variant.gallery)) {
          variant.gallery.forEach(img => imagePaths.add(img));
        }
      });
    }
    if (product.video) imagePaths.add(product.video);
  }

  console.log(`📊 Found ${imagePaths.size} unique images/videos\n`);

  // Step 3: Verify files exist
  console.log("✅ Checking file existence...");
  let existingCount = 0;
  const missingFiles = [];

  for (const imgPath of imagePaths) {
    const decodedPath = decodeURIComponent(imgPath);
    const fullPath = path.join(PUBLIC_DIR, decodedPath);
    
    if (fs.existsSync(fullPath)) {
      existingCount++;
    } else {
      missingFiles.push(decodedPath);
    }
  }

  console.log(`✓ ${existingCount}/${imagePaths.size} files exist locally`);
  if (missingFiles.length > 0) {
    console.log(`⚠️ ${missingFiles.length} files are missing:`);
    missingFiles.forEach(f => console.log(`   - ${f}`));
  }

  // Step 4: Generate Supabase URLs
  console.log("\n📋 Generating Supabase URLs...");
  const urlMap = new Map(); // old path -> new Supabase URL
  const SUPABASE_BASE = "https://opkgstmsfyjzbympczwd.supabase.co/storage/v1/object/public/product-images";
  
  for (const imgPath of imagePaths) {
    const decodedPath = decodeURIComponent(imgPath);
    const storagePath = `products/${decodedPath.replace(/\//g, "_")}`;
    const publicUrl = `${SUPABASE_BASE}/${storagePath}`;
    urlMap.set(decodedPath, publicUrl);
  }

  console.log(`✓ Generated URLs for ${urlMap.size} files`);

  // Step 5: Show sample URL mapping
  console.log("\n📍 Sample URL mappings:");
  let count = 0;
  for (const [oldPath, newUrl] of urlMap) {
    if (count < 3) {
      console.log(`\nOld: ${oldPath}`);
      console.log(`New: ${newUrl}`);
      count++;
    }
  }

  // Step 6: Generate SQL to update products
  console.log("\n\n🗄️ Generating SQL update statements...");
  console.log("(These can be used to update products directly in Supabase)\n");

  let sqlStatements = [];

  for (const product of productsData) {
    const updates = {};
    let hasChanges = false;

    // Update main image
    if (product.image && urlMap.has(decodeURIComponent(product.image))) {
      updates.image = urlMap.get(decodeURIComponent(product.image));
      hasChanges = true;
    }

    // Update gallery
    if (product.gallery && Array.isArray(product.gallery)) {
      const newGallery = product.gallery.map(img => {
        const decoded = decodeURIComponent(img);
        return urlMap.has(decoded) ? urlMap.get(decoded) : img;
      });
      updates.gallery = newGallery;
      hasChanges = true;
    }

    // Update color variants
    if (product.colorVariants && Array.isArray(product.colorVariants)) {
      const newVariants = product.colorVariants.map(variant => ({
        ...variant,
        image: variant.image && urlMap.has(decodeURIComponent(variant.image)) 
          ? urlMap.get(decodeURIComponent(variant.image)) 
          : variant.image,
        gallery: variant.gallery && Array.isArray(variant.gallery)
          ? variant.gallery.map(img => {
              const decoded = decodeURIComponent(img);
              return urlMap.has(decoded) ? urlMap.get(decoded) : img;
            })
          : variant.gallery
      }));
      updates.colorVariants = newVariants;
      hasChanges = true;
    }

    // Update video
    if (product.video && urlMap.has(decodeURIComponent(product.video))) {
      updates.video = urlMap.get(decodeURIComponent(product.video));
      hasChanges = true;
    }

    if (hasChanges) {
      const sqlUpdate = `UPDATE products SET ${Object.entries(updates)
        .map(([k, v]) => `${toSnakeCase(k)} = '${JSON.stringify(v).replace(/'/g, "''")}'`)
        .join(", ")} WHERE id = '${product.id}';`;
      sqlStatements.push(sqlUpdate);
    }
  }

  console.log(`Generated ${sqlStatements.length} UPDATE statements`);
  console.log("\n--- SQL Statements (first 2) ---");
  sqlStatements.slice(0, 2).forEach(stmt => {
    console.log(stmt.substring(0, 150) + "...\n");
  });

  // Step 7: Create updated products JSON
  console.log("\n📝 Creating updated products.json with Supabase URLs...");
  const updatedProducts = productsData.map(product => ({
    ...product,
    image: product.image && urlMap.has(decodeURIComponent(product.image))
      ? urlMap.get(decodeURIComponent(product.image))
      : product.image,
    gallery: product.gallery && Array.isArray(product.gallery)
      ? product.gallery.map(img => {
          const decoded = decodeURIComponent(img);
          return urlMap.has(decoded) ? urlMap.get(decoded) : img;
        })
      : product.gallery,
    colorVariants: product.colorVariants && Array.isArray(product.colorVariants)
      ? product.colorVariants.map(variant => ({
          ...variant,
          image: variant.image && urlMap.has(decodeURIComponent(variant.image))
            ? urlMap.get(decodeURIComponent(variant.image))
            : variant.image,
          gallery: variant.gallery && Array.isArray(variant.gallery)
            ? variant.gallery.map(img => {
                const decoded = decodeURIComponent(img);
                return urlMap.has(decoded) ? urlMap.get(decoded) : img;
              })
            : variant.gallery
        }))
      : product.colorVariants,
    video: product.video && urlMap.has(decodeURIComponent(product.video))
      ? urlMap.get(decodeURIComponent(product.video))
      : product.video
  }));

  // Save to backup first
  const backupPath = PRODUCTS_JSON + ".backup";
  fs.copyFileSync(PRODUCTS_JSON, backupPath);
  console.log(`✓ Created backup at ${backupPath}`);

  // Save updated products
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(updatedProducts, null, 2));
  console.log(`✓ Updated products.json with Supabase URLs`);

  console.log("\n\n🎉 Migration preparation complete!");
  console.log("\n📌 Next steps:");
  console.log("1. Ensure all images are uploaded to Supabase storage (product-images bucket)");
  console.log("2. Review the updated products.json file");
  console.log("3. Run the database update:");
  console.log(`   npx tsx scripts/update-products-db.ts`);
  console.log("4. Test the images are loading from Supabase");
  console.log("\n💾 Backup saved to: products.json.backup");
}

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

main().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
