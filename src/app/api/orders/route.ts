import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrders } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("kibana-user-id")?.value;
  
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user info from database
  const userRecord = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!userRecord.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userEmail = userRecord[0].email;

  const all = await getOrders();
  // Match by user.id or user.email stored in the order's user field
  const mine = all.filter(
    (o) => o.user?.id === userId || o.user?.email === userEmail
  );
  const sorted = mine.sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
  return NextResponse.json(sorted);
}
