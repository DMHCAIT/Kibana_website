import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });

async function checkCart() {
  console.log("\n📦 Cart Data Verification:\n");
  
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
    
    // Get cart items with product details
    const cartItems = await sql`
      SELECT uc.product_id, uc.quantity, p.name, p.price
      FROM user_cart uc
      JOIN products p ON p.id = uc.product_id
      WHERE uc.user_id = ${userId}
      ORDER BY uc.added_at
    `;
    
    console.log(`\n📦 Cart items for john@example.com: ${cartItems.length} items\n`);
    
    if (cartItems.length > 0) {
      cartItems.forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.title}`);
        console.log(`   - Product ID: ${item.product_id}, Qty: ${item.quantity}, Price: ₹${item.price}`);
      });
      console.log('\n✅ CART PERSISTENCE CONFIRMED - Data exists in database!');
    } else {
      console.log('❌ No items in cart');
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
  
  await sql.end();
  process.exit(0);
}

checkCart();
