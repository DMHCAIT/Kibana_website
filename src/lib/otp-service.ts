import postgres from "postgres";

// Use the same PostgreSQL connection as the main database
const databaseUrl = process.env.DATABASE_URL?.trim();
const sql = databaseUrl
  ? postgres(databaseUrl, {
      ssl: "require",
      max: 1, // Use pooler connection
    })
  : null;
const isDev = process.env.NODE_ENV === "development";

type InMemoryOtp = {
  otp: string;
  expiresAt: Date;
};

const inMemoryOtpStore = new Map<string, InMemoryOtp>();

function getSqlClient() {
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }
  return sql;
}

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
    const db = getSqlClient();
    console.log(`📝 Storing OTP for ${cleanEmail}, expires at ${expiresAt.toISOString()}`);

    // Delete any existing OTP for this email first
    const deleteResult = await db`
      DELETE FROM otp_sessions 
      WHERE phone = ${cleanEmail}
    `;
    console.log(`📝 Deleted ${deleteResult.count || 0} old OTP records for ${cleanEmail}`);

    // Store OTP in database
    const insertResult = await db`
      INSERT INTO otp_sessions (phone, otp, dev_otp, expires_at, created_at)
      VALUES (${cleanEmail}, ${otp}, ${otp}, ${expiresAt.toISOString()}, NOW())
    `;
    console.log(
      `✓ OTP stored successfully in database for ${cleanEmail}. Rows inserted: ${insertResult.count || 1}`,
    );
  } catch (error) {
    console.error("✗ Error storing OTP:", error);
    console.error(`   Email: ${cleanEmail}`);
    console.error(`   OTP: ${otp}`);
    if (isDev) {
      // Local fallback when database is unavailable in development
      inMemoryOtpStore.set(cleanEmail, { otp, expiresAt });
      console.log(`✓ OTP stored in memory fallback for ${cleanEmail}`);
      return;
    }
    throw error;
  }
}

// Get OTP from PostgreSQL database
export async function getOtp(email: string): Promise<string | null> {
  const cleanEmail = email.toLowerCase().trim();

  try {
    const db = getSqlClient();

    // Query database for valid OTP
    const result = await db`
      SELECT otp, dev_otp, expires_at 
      FROM otp_sessions 
      WHERE phone = ${cleanEmail}
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const data = result[0];
    const resolvedOtp = data.otp || data.dev_otp;

    // Check if expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    if (now > expiresAt) {
      // Delete expired OTP asynchronously
      db`DELETE FROM otp_sessions WHERE phone = ${cleanEmail}`.catch(() => {
        // Ignore errors
      });
      return null;
    }

    return resolvedOtp;
  } catch (error) {
    console.error("✗ Error getting OTP:", error);
    if (!isDev) return null;
    const inMemoryOtp = inMemoryOtpStore.get(cleanEmail);
    if (!inMemoryOtp) return null;
    if (new Date() > inMemoryOtp.expiresAt) {
      inMemoryOtpStore.delete(cleanEmail);
      return null;
    }
    return inMemoryOtp.otp;
  }
}

// Verify OTP from PostgreSQL database
export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.trim();

  console.log(`� Verifying OTP for ${cleanEmail}`);

  const stored = await getOtp(cleanEmail);

  if (stored === cleanOtp) {
    console.log(`✅ OTP verified for ${cleanEmail}`);
    // Delete OTP asynchronously after successful verification (don't block response)
    const db = getSqlClient();
    db`DELETE FROM otp_sessions WHERE phone = ${cleanEmail}`.catch(error => {
      console.error("✗ Error deleting OTP after verification:", error);
    });
    return true;
  }

  console.log(`❌ OTP verification failed for ${cleanEmail}`);
  return false;
}

// Clear OTP from PostgreSQL database
export async function clearOtp(email: string) {
  const cleanEmail = email.toLowerCase().trim();

  try {
    const db = getSqlClient();
    await db`
      DELETE FROM otp_sessions 
      WHERE phone = ${cleanEmail}
    `;
    console.log(`✓ OTP cleared for ${cleanEmail}`);
  } catch (error) {
    console.error("✗ Error clearing OTP:", error);
    if (isDev) inMemoryOtpStore.delete(cleanEmail);
  }
}
