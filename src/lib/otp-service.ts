import postgres from "postgres";

// Use the same PostgreSQL connection as the main database
const sql = postgres(process.env.DATABASE_URL!, { 
  ssl: "require",
  max: 1 // Use pooler connection
});

// Generate 6-digit OTP
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in PostgreSQL database
export async function storeOtp(email: string, otp: string, expiresInMinutes = 10) {
  const cleanEmail = email.toLowerCase().trim();
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

  try {
    console.log(`📝 Storing OTP for ${cleanEmail}, expires at ${expiresAt.toISOString()}`);
    
    // Delete any existing OTP for this email first
    const deleteResult = await sql`
      DELETE FROM email_otp_sessions 
      WHERE email = ${cleanEmail}
    `;
    console.log(`📝 Deleted ${deleteResult.count || 0} old OTP records for ${cleanEmail}`);

    // Store OTP in database
    const insertResult = await sql`
      INSERT INTO email_otp_sessions (email, otp, expires_at, created_at)
      VALUES (${cleanEmail}, ${otp}, ${expiresAt.toISOString()}, NOW())
    `;
    console.log(`✓ OTP stored successfully in database for ${cleanEmail}. Rows inserted: ${insertResult.count || 1}`);
  } catch (error) {
    console.error("✗ Error storing OTP:", error);
    console.error(`   Email: ${cleanEmail}`);
    console.error(`   OTP: ${otp}`);
  }
}

// Get OTP from PostgreSQL database
export async function getOtp(email: string): Promise<string | null> {
  const cleanEmail = email.toLowerCase().trim();

  try {
    console.log(`🔍 Getting OTP for ${cleanEmail}...`);
    
    // Query database for valid OTP
    const result = await sql`
      SELECT otp, expires_at 
      FROM email_otp_sessions 
      WHERE email = ${cleanEmail}
      LIMIT 1
    `;

    console.log(`🔍 Query returned ${result.length} rows for ${cleanEmail}`);

    if (result.length === 0) {
      console.log(`ℹ No OTP found for ${cleanEmail} - table might be empty or email not in database`);
      return null;
    }

    const data = result[0];
    console.log(`🔍 Found OTP record: otp_length=${data.otp?.length}, expires_at=${data.expires_at}`);

    // Check if expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const isExpired = now > expiresAt;
    console.log(`🔍 Expiry check: now=${now.toISOString()}, expires_at=${expiresAt.toISOString()}, expired=${isExpired}`);
    
    if (isExpired) {
      console.log(`ℹ OTP expired for ${cleanEmail}`);
      // Delete expired OTP
      await sql`
        DELETE FROM email_otp_sessions 
        WHERE email = ${cleanEmail}
      `;
      return null;
    }

    console.log(`✓ Returning valid OTP for ${cleanEmail}`);
    return data.otp;
  } catch (error) {
    console.error("✗ Error getting OTP:", error);
    console.error(`   Email: ${cleanEmail}`);
    return null;
  }
}

// Verify OTP from PostgreSQL database
export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.trim();

  console.log(`🔍 OTP Verification Attempt:`);
  console.log(`   Email: ${cleanEmail}`);
  console.log(`   Provided OTP: "${cleanOtp}" (length: ${cleanOtp.length})`);

  const stored = await getOtp(cleanEmail);
  console.log(`   Stored OTP: "${stored}" (length: ${stored?.length || 0})`);
  console.log(`   Match: ${stored === cleanOtp}`);

  if (stored === cleanOtp) {
    try {
      await sql`
        DELETE FROM email_otp_sessions 
        WHERE email = ${cleanEmail}
      `;
      console.log(`✓ OTP verified and deleted for ${cleanEmail}`);
    } catch (error) {
      console.error("✗ Error deleting OTP:", error);
    }
    return true;
  }

  console.log(`✗ OTP verification failed for ${cleanEmail}`);
  return false;
}

// Clear OTP from PostgreSQL database
export async function clearOtp(email: string) {
  const cleanEmail = email.toLowerCase().trim();

  try {
    await sql`
      DELETE FROM email_otp_sessions 
      WHERE email = ${cleanEmail}
    `;
    console.log(`✓ OTP cleared for ${cleanEmail}`);
  } catch (error) {
    console.error("✗ Error clearing OTP:", error);
  }
}
