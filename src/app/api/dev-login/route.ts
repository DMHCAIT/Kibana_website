import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createLocalUser, getLocalUserByEmail } from "@/lib/local-user-store";

/**
 * DEV-ONLY quick login endpoint
 * POST /api/dev-login with { email?, name? } to auto-login without OTP
 * GET /api/dev-login to get the current test user
 *
 * Returns: { user, message }
 * Sets kibana-user-id cookie for 30 days
 *
 * ⚠️ Only available in development mode
 */

const isDev = process.env.NODE_ENV === "development";
const TEST_EMAIL = "test@kibana.local";
const TEST_NAME = "Test User";

export async function GET() {
  if (!isDev) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    // Try to get from DB first
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, TEST_EMAIL))
      .limit(1);

    const user = users[0];

    // If not in DB, create locally
    if (!user) {
      const localUser = await getLocalUserByEmail(TEST_EMAIL);
      if (!localUser) {
        const created = await createLocalUser({
          email: TEST_EMAIL,
          name: TEST_NAME,
          phone: "+91-9999999999",
        });
        if (!created.user) {
          return NextResponse.json({ error: "Failed to create dev test user" }, { status: 500 });
        }
        const response = NextResponse.json({
          user: {
            id: created.user.id,
            email: created.user.email,
            name: created.user.name,
            phone: created.user.phone,
          },
          message: "✅ Dev test user created and logged in",
        });
        response.cookies.set({
          name: "kibana-user-id",
          value: created.user.id,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
        return response;
      }
      const response = NextResponse.json({
        user: {
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          phone: localUser.phone,
        },
        message: "✅ Dev test user logged in",
      });
      response.cookies.set({
        name: "kibana-user-id",
        value: localUser.id,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      return response;
    }

    // User exists in DB
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      message: "✅ Dev test user logged in",
    });
    response.cookies.set({
      name: "kibana-user-id",
      value: user.id,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("❌ Dev login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDev) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { email?: string; name?: string };
    const email = (body.email || TEST_EMAIL).toLowerCase().trim();
    const name = body.name || TEST_NAME;

    let userId: string;
    let userData: { id: string; email: string; name: string; phone?: string };

    // Try database first
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .catch(() => []);

    if (existing.length > 0) {
      userId = existing[0].id;
      userData = {
        id: existing[0].id,
        email: existing[0].email!,
        name: existing[0].name || name,
        phone: existing[0].phone || undefined,
      };
    } else {
      // Create new user
      userId = randomUUID();
      try {
        await db.insert(usersTable).values({
          id: userId,
          email,
          name,
          phone: "+91-9999999999",
          loginCount: 1,
          loginAt: new Date(),
          registeredAt: new Date(),
        });
        userData = { id: userId, email, name, phone: "+91-9999999999" };
      } catch {
        // Fall back to local store
        const localResult = await createLocalUser({ email, name, phone: "+91-9999999999" });
        if (!localResult.user) {
          return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }
        userId = localResult.user.id;
        userData = {
          id: localResult.user.id,
          email: localResult.user.email,
          name: localResult.user.name,
          phone: localResult.user.phone,
        };
      }
    }

    const response = NextResponse.json({
      user: userData,
      message: `✅ Logged in as ${email}`,
    });

    response.cookies.set({
      name: "kibana-user-id",
      value: userId,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Dev login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
