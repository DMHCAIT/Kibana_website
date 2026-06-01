import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, user_cart, user_wishlist } from './src/lib/db/schema';
import { count } from 'drizzle-orm';

async function checkDatabaseStatus() {
  let client;
  try {
    console.log('🔍 Checking Kibana Database Status...\n');

    // Connect directly with the pooler connection string
    const connectionString = 'postgresql://postgres.opkgstmsfyjzbympczwd:Kibana%402026@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';
    client = postgres(connectionString);
    const db = drizzle(client);

    const userCount = await db.select({ count: count() }).from(users);
    const cartCount = await db.select({ count: count() }).from(user_cart);
    const wishlistCount = await db.select({ count: count() }).from(user_wishlist);

    console.log('📊 Database Stats:');
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Cart Items: ${cartCount[0].count}`);
    console.log(`   Wishlist Items: ${wishlistCount[0].count}`);

    // Show some recent cart items
    const recentCart = await db.query.user_cart.findMany({
      limit: 5,
      orderBy: (cart, { desc }) => [desc(cart.created_at)],
      with: {
        product: true,
        user: true,
      },
    });

    if (recentCart.length > 0) {
      console.log('\n📦 Recent Cart Items:');
      for (const item of recentCart) {
        console.log(`   - ${item.user.email}: ${item.product.name} x${item.quantity}`);
      }
    }

    console.log('\n✅ Database is responsive and working!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

checkDatabaseStatus();
