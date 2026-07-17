import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

async function runMigration() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('Connecting to database...');
    const result = await sql`SELECT now()`;
    console.log('✓ Connected successfully:', result[0]);

    console.log('\nRunning migration...');
    await sql`ALTER TABLE "user_cart" ADD COLUMN IF NOT EXISTS "product_name" text`;
    console.log('✓ Added product_name column');

    await sql`ALTER TABLE "user_cart" ADD COLUMN IF NOT EXISTS "product_image" text`;
    console.log('✓ Added product_image column');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    try {
      await sql.end();
    } catch (e) {
      console.error('Error closing connection:', e.message);
    }
  }
}

runMigration();
