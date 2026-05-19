import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("kibana_session")?.value;
    if (!token) return NextResponse.json({ user: null });

    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.token, token));

    if (!session || new Date() > session.expiresAt) {
      const res = NextResponse.json({ user: null });
      res.cookies.delete("kibana_session");
      return res;
    }

    return NextResponse.json({
      user: { id: session.userId, phone: session.phone, name: session.name },
    });
  } catch (err) {
    console.error("[auth/me]", err);
    return NextResponse.json({ user: null });
  }
}
