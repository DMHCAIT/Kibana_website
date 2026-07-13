import { db } from "./src/lib/db.ts";
import { products as productsTable } from "@/lib/db";

try {
  const products = await db.select().from(productsTable);
  const product = products.find(p => p.name.toLowerCase().includes("halo") || p.slug.toLowerCase().includes("halo"));
  
  if (product) {
    console.log("\n=== Product Found ===");
    console.log("ID:", product.id);
    console.log("Name:", product.name);
    console.log("Slug:", product.slug);
    
    if (product.color_variants && product.color_variants.length > 0) {
      console.log("\n=== Color Variants ===");
      product.color_variants.forEach(v => {
        console.log(`- Color: ${v.color}, productTitle: ${v.productTitle || "NONE"}`);
      });
    }
  } else {
    console.log("No product with 'halo' found");
    console.log("\nFirst 5 products:");
    products.slice(0, 5).forEach(p => {
      console.log(`- ${p.name} (${p.slug})`);
    });
  }
} catch (error) {
  console.error("Error:", error);
}
