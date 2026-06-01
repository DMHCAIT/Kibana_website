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
    // Delete any existing OTP for this email first
    await sql`
      DELETE FROM email_otp_sessions 
      WHERE email = ${cleanEmail}
    `;

    // Store OTP in database
    await sql`
      INSERT INTO email_otp_sessions (email, otp, expires_at, created_at)
      VALUES (${cleanEmail}, ${otp}, ${expiresAt.toISOString()}, NOW())
    `;

    console.log(`✓ OTP stored in database for ${cleanEmail}`);
  } catch (error) {
    console.error("✗ Error storing OTP:", error);
  }
}

// Get OTP from PostgreSQL database
export async function getOtp(email: string): Promise<string | null> {
  const cleanEmail = email.toLowerCase().trim();

  try {
    // Query database for valid OTP
    const result = await sql`
      SELECT otp, expires_at 
      FROM email_otp_sessions 
      WHERE email = ${cleanEmail}
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log(`ℹ No OTP found for ${cleanEmail}`);
      return null;
    }

    const data = result[0];

    // Check if expired
    const expiresAt = new Date(data.expires_at);
    if (new Date() > expiresAt) {
      console.log(`ℹ OTP expired for ${cleanEmail}`);
      // Delete expired OTP
      await sql`
        DELETE FROM email_otp_sessions 
        WHERE email = ${cleanEmail}
      `;
      return null;
    }

    return data.otp;
  } catch (error) {
    console.error("✗ Error getting OTP:", error);
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
