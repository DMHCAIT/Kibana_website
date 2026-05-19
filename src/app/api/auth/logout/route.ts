import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("kibana_session")?.value;
  if (token) {
    await db.delete(userSessions).where(eq(userSessions.token, token)).catch(() => {});
  }
  const res = NextResponse.json({ success: true });
  res.cookies.delete("kibana_session");
  return res;
}
