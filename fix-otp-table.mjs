import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

try {
  console.log('🔍 Checking current otp_sessions table structure...');
  
  // Check current columns
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'otp_sessions'
    ORDER BY ordinal_position
  `;
  
  console.log('Current columns in otp_sessions:');
  columns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type}`);
  });
  
  const columnNames = columns.map(c => c.column_name);
  
  // Add missing otp column if it doesn't exist
  if (!columnNames.includes('otp')) {
    console.log('\n📝 Adding missing "otp" column...');
    await sql`ALTER TABLE otp_sessions ADD COLUMN otp TEXT`;
    console.log('✓ Added otp column');
  }
  
  // Add missing two_factor_session_id column if it doesn't exist
  if (!columnNames.includes('two_factor_session_id')) {
    console.log('📝 Adding missing "two_factor_session_id" column...');
    await sql`ALTER TABLE otp_sessions ADD COLUMN two_factor_session_id TEXT`;
    console.log('✓ Added two_factor_session_id column');
  }
  
  // Add missing dev_otp column if it doesn't exist
  if (!columnNames.includes('dev_otp')) {
    console.log('📝 Adding missing "dev_otp" column...');
    await sql`ALTER TABLE otp_sessions ADD COLUMN dev_otp TEXT`;
    console.log('✓ Added dev_otp column');
  }
  
  console.log('\n✅ All missing columns have been added successfully!');
  console.log('🚀 The OTP system should now work correctly.');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
