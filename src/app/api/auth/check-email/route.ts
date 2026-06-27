import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getLocalUserByEmail } from "@/lib/local-user-store";

const isDev = process.env.NODE_ENV === "development";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists in our PostgreSQL database
    try {
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, cleanEmail))
        .limit(1);

      const exists = existingUser.length > 0;
      console.log(`📧 Email check for ${cleanEmail}: exists=${exists}`);

      return NextResponse.json({ exists });
    } catch (err) {
      console.error(`❌ Error checking email in database:`, err);
      if (isDev) {
        // Dev-only fallback to local JSON users store when DB is unavailable
        const localUser = await getLocalUserByEmail(cleanEmail);
        return NextResponse.json({ exists: !!localUser });
      }
      return NextResponse.json({ exists: false });
    }
  } catch (err) {
    console.error(`❌ Error in check-email route:`, err);
    return NextResponse.json({ exists: false });
  }
}
