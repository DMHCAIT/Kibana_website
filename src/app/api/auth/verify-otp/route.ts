import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, otpSessions, userSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const SESSION_DAYS = 30;

async function verify2FactorOtp(sessionId: string, otp: string): Promise<boolean> {
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  if (!apiKey) return false;
  const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.Status === "Success";
}

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, name } = await req.json() as { phone: string; otp: string; name?: string };

    const normalized = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(normalized) || !otp || otp.length !== 6) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Fetch OTP session
    const [session] = await db
      .select()
      .from(otpSessions)
      .where(eq(otpSessions.phone, normalized));

    if (!session) {
      return NextResponse.json({ error: "No OTP was sent to this number. Please request a new OTP." }, { status: 400 });
    }
    if (new Date() > session.expiresAt) {
      await db.delete(otpSessions).where(eq(otpSessions.phone, normalized));
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Verify OTP
    let verified = false;
    const devMode = !process.env.TWO_FACTOR_API_KEY;

    if (devMode) {
      verified = session.devOtp === otp;
    } else if (session.twoFactorSessionId) {
      verified = await verify2FactorOtp(session.twoFactorSessionId, otp);
    }

    if (!verified) {
      return NextResponse.json({ error: "Incorrect OTP. Please check and try again." }, { status: 400 });
    }

    // OTP verified — delete it
    await db.delete(otpSessions).where(eq(otpSessions.phone, normalized));

    // Find or create user
    let [user] = await db.select().from(users).where(eq(users.phone, normalized));

    if (user) {
      // Existing user — update login tracking
      await db
        .update(users)
        .set({
          loginAt: new Date(),
          loginCount: user.loginCount + 1,
        })
        .where(eq(users.id, user.id));
      user = { ...user, loginCount: user.loginCount + 1, loginAt: new Date() };
    } else {
      // New user — create account
      const trimmedName = name?.trim();
      if (!trimmedName) {
        return NextResponse.json({ error: "Please provide your name to complete signup." }, { status: 400 });
      }
      const newUser = {
        id: `u_${randomUUID()}`,
        phone: normalized,
        name: trimmedName,
        email: null,
        loginCount: 1,
        loginAt: new Date(),
        registeredAt: new Date(),
      };
      await db.insert(users).values(newUser);
      user = newUser;
    }

    // Create a session token (30-day expiry)
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(userSessions).values({
      token,
      userId: user.id,
      phone: user.phone ?? "",
      name: user.name,
      expiresAt,
    });

    const userData = { id: user.id, phone: user.phone, name: user.name };

    const res = NextResponse.json({ success: true, user: userData });

    // Set httpOnly session cookie
    res.cookies.set("kibana_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
