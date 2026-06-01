import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function checkDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("❌ Missing Supabase credentials");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", url);
    console.error("SUPABASE_SERVICE_ROLE_KEY:", key?.substring(0, 20) + "...");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n========== CHECKING DATABASE ==========\n");

  // Check OTP Sessions
  console.log("📧 OTP SESSIONS:");
  const { data: otpData } = await sb.from("email_otp_sessions").select("*");
  console.log(JSON.stringify(otpData, null, 2));

  // Check Users
  console.log("\n👥 USERS IN DATABASE:");
  const { data: usersData } = await sb.from("users").select("*");
  console.log(JSON.stringify(usersData, null, 2));

  // Check Supabase Auth Users
  console.log("\n🔐 SUPABASE AUTH USERS:");
  const { data: authData } = await sb.auth.admin.listUsers();
  console.log(JSON.stringify(
    authData.users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    })),
    null,
    2
  ));

  // Check Orders
  console.log("\n📦 ORDERS:");
  const { data: ordersData } = await sb.from("orders").select("*").limit(5);
  console.log(JSON.stringify(ordersData, null, 2));

  console.log("\n========== END DATABASE CHECK ==========\n");
}

checkDatabase().catch(console.error);
