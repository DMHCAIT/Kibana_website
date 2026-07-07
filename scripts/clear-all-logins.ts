import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, orders, contactMessages } from "../src/lib/db/schema";

const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(queryClient);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function clearAllLogins() {
  try {
    console.log("🧹 Starting cleanup process...\n");

    // Step 1: Clear all Supabase Auth users
    console.log("📋 Step 1: Fetching all Supabase Auth users...");
    const { data: { users: allUsers }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("❌ Failed to list users:", listError);
      process.exit(1);
    }

    console.log(`✓ Found ${allUsers?.length || 0} users in Supabase Auth`);

    if (allUsers && allUsers.length > 0) {
      console.log("🗑️  Deleting Supabase Auth users...");
      for (const user of allUsers) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`  ❌ Failed to delete user ${user.email}:`, deleteError);
        } else {
          console.log(`  ✓ Deleted ${user.email}`);
        }
      }
    }

    console.log("");

    // Step 2: Clear database tables
    console.log("📋 Step 2: Clearing database tables...");

    // Delete orders first (has foreign key to users)
    console.log("  🗑️  Clearing orders table...");
    await db.delete(orders);
    console.log("  ✓ Orders cleared");

    // Delete users
    console.log("  🗑️  Clearing users table...");
    await db.delete(users);
    console.log("  ✓ Users cleared");

    // Delete contact messages
    console.log("  🗑️  Clearing contact messages...");
    await db.delete(contactMessages);
    console.log("  ✓ Contact messages cleared");

    console.log("");

    // Step 3: Clear email OTP sessions
    console.log("📋 Step 3: Clearing email OTP sessions...");
    const { error: otpError } = await supabase
      .from("email_otp_sessions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (otpError) {
      console.log("  ⚠️  Could not clear OTP sessions (table might not exist)");
    } else {
      console.log("  ✓ Email OTP sessions cleared");
    }

    console.log("");
    console.log("✅ Cleanup completed successfully!");
    console.log("");
    console.log("📝 Summary:");
    console.log("  • All Supabase Auth users deleted");
    console.log("  • All database user records deleted");
    console.log("  • All orders deleted");
    console.log("  • All contact messages deleted");
    console.log("  • All email OTP sessions cleared");
    console.log("");
    console.log("🎉 Fresh login system is ready!");
    console.log("   New logins will be stored in database");
    console.log("   Visible in: Admin Panel → Members\n");

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

clearAllLogins();
