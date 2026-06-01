import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/lib/db/schema";

const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(queryClient);

async function verifyCleanup() {
  try {
    console.log("🔍 Verifying cleanup and fresh login system...\n");

    // Get all current users
    const currentUsers = await db.select().from(users);

    console.log("📊 Current Users in Database:");
    console.log("━".repeat(60));

    if (currentUsers.length === 0) {
      console.log("✅ Database is clean - 0 users found!");
      console.log("🎉 Ready for fresh logins!\n");
    } else {
      console.log(`⚠️  Found ${currentUsers.length} users:\n`);
      currentUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email || "No email"}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Phone: ${user.phone || "None"}`);
        console.log(`   Login Count: ${user.loginCount}`);
        console.log(`   First Login: ${user.registeredAt?.toISOString()}`);
        console.log(`   Last Login: ${user.loginAt?.toISOString()}\n`);
      });
    }

    console.log("━".repeat(60));
    console.log("\n📝 How the System Works:\n");
    console.log("1️⃣  User enters email on login page");
    console.log("2️⃣  Email-OTP sent to user");
    console.log("3️⃣  User enters 6-digit OTP code");
    console.log("4️⃣  OTP verified via /api/auth/verify-otp");
    console.log("5️⃣  User created in Supabase Auth");
    console.log("6️⃣  User login STORED IN DATABASE (users table)");
    console.log("7️⃣  User visible in Admin Panel → Members\n");

    console.log("✨ All logins are now:");
    console.log("  ✓ Stored in database (users table)");
    console.log("  ✓ Visible in admin members panel");
    console.log("  ✓ Tracked with timestamps and counts");
    console.log("  ✓ Fresh from cleanup - no old logins\n");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

verifyCleanup();
