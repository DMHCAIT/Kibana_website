import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, user_cart, user_wishlist } from './src/lib/db/schema';
import { count } from 'drizzle-orm';

async function checkDatabaseStatus() {
  let client: any;
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

    console.log('\n✅ Database is responsive!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
}

checkDatabaseStatus();
