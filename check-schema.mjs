import postgres from "postgres";

const databaseUrl = "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";
const sql = postgres(databaseUrl, { ssl: "require" });

try {
  console.log("🔍 Checking table schemas...\n");
  
  const emailOtpCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='email_otp_sessions' 
    ORDER BY ordinal_position
  `;
  
  if (emailOtpCols.length > 0) {
    console.log("email_otp_sessions columns:");
    emailOtpCols.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));
  } else {
    console.log("❌ email_otp_sessions table not found");
  }
  
  console.log("");
  
  const otpCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='otp_sessions' 
    ORDER BY ordinal_position
  `;
  
  if (otpCols.length > 0) {
    console.log("otp_sessions columns:");
    otpCols.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));
  } else {
    console.log("❌ otp_sessions table not found");
  }
  
  await sql.end();
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
