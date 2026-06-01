import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp, storeOtp } from "@/lib/otp-service";

export async function POST(request: Request) {
  try {
    const { email, type, name } = await request.json() as {
      email?: string;
      type?: "signup" | "login";
      name?: string;
    };

    if (!email || !type) {
      return NextResponse.json(
        { error: "Missing email or type" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate OTP
    const otp = generateOtp();
    console.log(`📧 Generated OTP: ${otp} for ${cleanEmail}`);

    // Store OTP in database immediately
    await storeOtp(cleanEmail, otp, 10); // 10 minute expiry

    // Send email asynchronously (don't wait for it)
    // This allows us to return immediately to the user
    sendOtpEmail({
      email: cleanEmail,
      otp,
      type,
      name,
    }).catch((error) => {
      console.error(`❌ Failed to send email to ${cleanEmail}:`, error?.message || error);
    });

    return NextResponse.json({ 
      success: true,
      message: `Verification code sent to ${cleanEmail}`
    });
  } catch (error) {
    console.error("Error in send-otp route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
