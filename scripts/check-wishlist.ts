import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });

async function checkWishlist() {
  console.log("\n💝 Wishlist Data Verification:\n");
  
  try {
    // Get user ID for john@example.com
    const userResult = await sql`
      SELECT id, email, name 
      FROM users 
      WHERE email = 'john@example.com' 
      LIMIT 1
    `;
    
    if (userResult.length === 0) {
      console.log('❌ User john@example.com not found');
      await sql.end();
      process.exit(0);
    }
    
    const userId = userResult[0].id;
    console.log('✓ User found:', { id: userId, email: userResult[0].email, name: userResult[0].name });
    
    // Get wishlist items with product details
    const wishlistItems = await sql`
      SELECT uw.product_id, p.name, p.price
      FROM user_wishlist uw
      JOIN products p ON p.id = uw.product_id
      WHERE uw.user_id = ${userId}
      ORDER BY uw.added_at
    `;
    
    console.log(`\n💝 Wishlist items for john@example.com: ${wishlistItems.length} items\n`);
    
    if (wishlistItems.length > 0) {
      wishlistItems.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.name || 'N/A'}`);
        console.log(`   - Product ID: ${item.product_id}, Price: ₹${item.price}`);
      });
      console.log('\n✅ WISHLIST DATA EXISTS - Data persisted in database!');
    } else {
      console.log('ℹ️ No items in wishlist (empty)');
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
  
  await sql.end();
  process.exit(0);
}

checkWishlist();
