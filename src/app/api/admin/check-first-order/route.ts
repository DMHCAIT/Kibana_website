import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { getLocalUserById } from "@/lib/local-user-store";
import { isFirstTimeCustomer } from "@/lib/server-data";

export const dynamic = "force-dynamic";
const isDev = process.env.NODE_ENV === "development";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userEmail: string | null;
    try {
      const [user] = await db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);
      userEmail = user?.email ?? null;
    } catch (error) {
      if (!isDev) throw error;
      const localUser = await getLocalUserById(userId);
      userEmail = localUser?.email ?? null;
    }

    if (!userEmail && isDev) {
      const localUser = await getLocalUserById(userId);
      userEmail = localUser?.email ?? null;
    }
    if (!userEmail) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isFirstTime = await isFirstTimeCustomer(userId, userEmail);
    return NextResponse.json({ isFirstTime });
  } catch (error) {
    console.error("❌ Error checking first-time customer:", error);
    return NextResponse.json({ error: "Failed to check customer status" }, { status: 500 });
  }
}
