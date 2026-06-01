import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });

async function main() {
  console.log("\n📧 Recent OTPs in Database:\n");
  
  const result = await sql`
    SELECT email, otp, expires_at, created_at 
    FROM email_otp_sessions 
    ORDER BY created_at DESC 
    LIMIT 10
  `;
  
  result.forEach((row, i) => {
    console.log(`${i + 1}. Email: ${row.email}`);
    console.log(`   OTP: ${row.otp}`);
    console.log(`   Created: ${row.created_at}`);
    console.log(`   Expires: ${row.expires_at}`);
    console.log();
  });

  await sql.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
