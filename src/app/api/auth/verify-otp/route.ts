import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { verifyOtp } from "@/lib/otp-service";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { invalidateCache } from "@/lib/server-data";
import { createLocalUser, loginLocalUserByEmail } from "@/lib/local-user-store";

const isDev = process.env.NODE_ENV === "development";

interface UserData {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    phone: string;
  };
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { email, otp, signupData } = (await request.json()) as {
      email?: string;
      otp?: string;
      signupData?: { name: string; phone: string };
    };

    // Validate input
    if (!email || !otp) {
      console.log("❌ Missing email or OTP in request");
      return NextResponse.json({ error: "Missing email or OTP" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log(`🔐 Starting OTP verification for ${cleanEmail} with code: ${otp.trim()}`);
    const verifyStart = Date.now();
    const isValid = await verifyOtp(cleanEmail, otp.trim());
    console.log(`⏱️ OTP verification took ${Date.now() - verifyStart}ms`);

    if (!isValid) {
      console.log("❌ OTP verification failed for", cleanEmail);
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 401 });
    }

    console.log("✅ OTP verified successfully for", cleanEmail);

    let user = null;
    let usedLocalFallback = false;

    // For new signups, create user directly in our database (skip slow Supabase Auth API)
    // For login, the user should already exist in our database
    if (signupData) {
      // SIGNUP: Check if user already exists, then create
      console.log(`👤 [STEP 1] Checking if user exists for ${cleanEmail}...`);

      try {
        // Check if user already exists
        const existingUsers = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, cleanEmail))
          .limit(1);

        if (existingUsers.length > 0) {
          console.log(`❌ [STEP 1] User already exists: ${cleanEmail}`);
          return NextResponse.json(
            { error: "Account already exists with this email" },
            { status: 409 },
          );
        }

        console.log(`👤 [STEP 1a] Generating UUID...`);
        const userId = randomUUID();
        console.log(`👤 [STEP 1b] UUID generated: ${userId}`);

        console.log(`👤 [STEP 1c] Creating new user in database...`);
        const insertStart = Date.now();

        // Create new user
        await db.insert(usersTable).values({
          id: userId,
          email: cleanEmail,
          name: signupData.name?.trim() || "",
          phone: signupData.phone?.trim() || "",
          loginCount: 1,
          loginAt: new Date(),
          registeredAt: new Date(),
        });

        console.log(
          `👤 [STEP 1d] User created in ${Date.now() - insertStart}ms with ID: ${userId}`,
        );

        // Invalidate admin cache so the new user appears in the Members page
        invalidateCache("users");

        user = {
          id: userId,
          email: cleanEmail,
          user_metadata: {
            name: signupData.name?.trim() || "",
            phone: signupData.phone?.trim() || "",
          },
        } as UserData;
      } catch (err) {
        console.error("❌ Signup error:", err);
        if (!isDev) {
          return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
        }
        // Dev-only local fallback when DB is unavailable
        const localResult = await createLocalUser({
          email: cleanEmail,
          name: signupData.name,
          phone: signupData.phone,
        });
        if (localResult.error === "already_exists") {
          return NextResponse.json(
            { error: "Account already exists with this email" },
            { status: 409 },
          );
        }
        if (!localResult.user) {
          return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
        }
        usedLocalFallback = true;
        user = {
          id: localResult.user.id,
          email: localResult.user.email,
          user_metadata: {
            name: localResult.user.name || "",
            phone: localResult.user.phone || "",
          },
        } as UserData;
      }
    } else {
      // LOGIN: Get existing user from database
      try {
        console.log(`👤 [STEP 2] Looking up user in database for ${cleanEmail}...`);

        const existingUsers = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, cleanEmail))
          .limit(1);

        if (existingUsers.length === 0) {
          console.log(`❌ [STEP 2] User not found: ${cleanEmail}`);
          return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
        }

        const existingUser = existingUsers[0];
        console.log(`✅ [STEP 2] User found: ${existingUser.id}`);

        user = {
          id: existingUser.id,
          email: cleanEmail,
          user_metadata: {
            name: existingUser.name || "",
            phone: existingUser.phone || "",
          },
        } as UserData;
      } catch (err) {
        console.error("❌ Login lookup error:", err);
        if (!isDev) {
          return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });
        }
        // Dev-only local fallback when DB is unavailable
        const localResult = await loginLocalUserByEmail(cleanEmail);
        if (localResult.error === "not_found") {
          return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
        }
        if (!localResult.user) {
          return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });
        }
        usedLocalFallback = true;
        user = {
          id: localResult.user.id,
          email: localResult.user.email,
          user_metadata: {
            name: localResult.user.name || "",
            phone: localResult.user.phone || "",
          },
        } as UserData;
      }
    }

    // Build response user object
    const displayName =
      signupData?.name?.trim() ||
      (user?.user_metadata?.name as string | undefined) ||
      user?.email!.split("@")[0];

    const displayPhone =
      signupData?.phone?.trim() || (user?.user_metadata?.phone as string | undefined);

    const responseUser = {
      id: user.id,
      email: user.email!,
      name: displayName,
      ...(displayPhone && { phone: displayPhone }),
    };

    // Record the user login in the database (for login, increment count)
    if (!signupData && !usedLocalFallback) {
      // For login, increment the login count
      console.log(`📝 [STEP 3] Updating login count...`);
      const updateStart = Date.now();
      try {
        await db
          .update(usersTable)
          .set({
            loginCount: sql`${usersTable.loginCount} + 1`,
            loginAt: new Date(),
          })
          .where(eq(usersTable.email, cleanEmail));

        console.log(`📝 [STEP 3] Login count updated in ${Date.now() - updateStart}ms`);
      } catch (updateErr) {
        console.error(`❌ [STEP 3] UPDATE error:`, updateErr);
        // Don't throw - login still succeeds even if update fails
      }
    }
    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Total verification time: ${totalTime}ms`);

    const response = NextResponse.json({
      success: true,
      user: responseUser,
    });

    // Set a session cookie with the user ID for API authentication
    response.cookies.set({
      name: "kibana-user-id",
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("Error in verify-otp route after", totalTime, "ms:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
