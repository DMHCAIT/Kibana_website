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
    console.log(`🔍 Getting OTP for ${cleanEmail}...`);

    // Query database for valid OTP
    const result = await db`
      SELECT otp, dev_otp, expires_at 
      FROM otp_sessions 
      WHERE phone = ${cleanEmail}
      LIMIT 1
    `;

    console.log(`🔍 Query returned ${result.length} rows for ${cleanEmail}`);

    if (result.length === 0) {
      console.log(
        `ℹ No OTP found for ${cleanEmail} - table might be empty or email not in database`,
      );
      return null;
    }

    const data = result[0];
    const resolvedOtp = data.otp || data.dev_otp;
    console.log(
      `🔍 Found OTP record: otp_length=${resolvedOtp?.length}, expires_at=${data.expires_at}`,
    );

    // Check if expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const isExpired = now > expiresAt;
    console.log(
      `🔍 Expiry check: now=${now.toISOString()}, expires_at=${expiresAt.toISOString()}, expired=${isExpired}`,
    );

    if (isExpired) {
      console.log(`ℹ OTP expired for ${cleanEmail}`);
      // Delete expired OTP
      await db`
        DELETE FROM otp_sessions 
        WHERE phone = ${cleanEmail}
      `;
      return null;
    }

    console.log(`✓ Returning valid OTP for ${cleanEmail}`);
    return resolvedOtp;
  } catch (error) {
    console.error("✗ Error getting OTP:", error);
    console.error(`   Email: ${cleanEmail}`);
    if (!isDev) return null;
    const inMemoryOtp = inMemoryOtpStore.get(cleanEmail);
    if (!inMemoryOtp) return null;
    if (new Date() > inMemoryOtp.expiresAt) {
      inMemoryOtpStore.delete(cleanEmail);
      return null;
    }
    console.log(`✓ Using in-memory OTP fallback for ${cleanEmail}`);
    return inMemoryOtp.otp;
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
      const db = getSqlClient();
      await db`
        DELETE FROM otp_sessions 
        WHERE phone = ${cleanEmail}
      `;
      console.log(`✓ OTP verified and deleted for ${cleanEmail}`);
    } catch (error) {
      console.error("✗ Error deleting OTP:", error);
      if (isDev) inMemoryOtpStore.delete(cleanEmail);
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
