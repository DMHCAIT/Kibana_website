import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, otpSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const OTP_TTL_MINUTES = 10;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function send2FactorOtp(phone: string, otp: string): Promise<string | null> {
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  if (!apiKey) return null; // dev mode

  const url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${phone}/${otp}/OTP1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.Status === "Success") return data.Details as string; // session ID
  throw new Error(`2Factor error: ${data.Details}`);
}

export async function POST(req: NextRequest) {
  try {
    const { phone, mode } = await req.json() as { phone: string; mode: "login" | "signup" };

    const normalized = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(normalized)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.phone, normalized));

    if (mode === "signup" && existing) {
      return NextResponse.json(
        { error: "already_exists", message: "This number is already registered. Please log in instead." },
        { status: 409 }
      );
    }
    if (mode === "login" && !existing) {
      return NextResponse.json(
        { error: "not_found", message: "No account found with this number. Please sign up first." },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Try to send via 2Factor.in
    let twoFactorSessionId: string | null = null;
    const devMode = !process.env.TWO_FACTOR_API_KEY;

    if (!devMode) {
      twoFactorSessionId = await send2FactorOtp(normalized, otp);
    } else {
      // Dev/test mode — print OTP to server console
      console.log(`\n📱 [DEV OTP] Phone: +91${normalized}  OTP: ${otp}  (expires in ${OTP_TTL_MINUTES} min)\n`);
    }

    // Upsert OTP session (one active OTP per phone at a time)
    await db
      .insert(otpSessions)
      .values({
        phone: normalized,
        twoFactorSessionId,
        devOtp: devMode ? otp : null, // only store OTP locally in dev mode
        expiresAt,
      })
      .onConflictDoUpdate({
        target: otpSessions.phone,
        set: {
          twoFactorSessionId,
          devOtp: devMode ? otp : null,
          expiresAt,
          createdAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      isNewUser: !existing,
      // Only expose OTP in dev mode (no API key configured) — for testing
      ...(devMode && { devOtp: otp }),
    });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
  }
}
