import { NextResponse } from "next/server";
import { getOtp } from "@/lib/otp-service";

// DEVELOPMENT ONLY: Get OTP for testing
// This endpoint should NEVER be exposed in production
export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const { email } = await request.json() as { email?: string };

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log(`🔍 [DEV] dev-get-otp called for ${cleanEmail}`);
    
    const otp = await getOtp(cleanEmail);

    if (!otp) {
      console.error(`❌ [DEV] No OTP found for ${cleanEmail}`);
      return NextResponse.json(
        { error: "No OTP found for this email", otp: null },
        { status: 404 }
      );
    }

    console.log(`✅ [DEV] Successfully retrieved OTP for ${cleanEmail}: ${otp}`);

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      otp,
      note: "⚠️ This endpoint is for development only!"
    });
  } catch (error) {
    console.error("Error in dev-get-otp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
