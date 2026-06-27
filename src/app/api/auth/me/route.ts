import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getLocalUserById } from "@/lib/local-user-store";

const isDev = process.env.NODE_ENV === "development";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("kibana-user-id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRecord = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!userRecord.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRecord[0];
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || (user.email ? user.email.split("@")[0] : "User"),
      phone: user.phone,
    });
  } catch (error) {
    console.error("❌ GET /api/auth/me error:", error);
    if (isDev) {
      const localUser = await getLocalUserById(userId);
      if (localUser) {
        return NextResponse.json({
          id: localUser.id,
          email: localUser.email,
          name: localUser.name || localUser.email.split("@")[0],
          phone: localUser.phone,
        });
      }
    }
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
