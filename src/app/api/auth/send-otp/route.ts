import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp, getOtp, storeOtp } from "@/lib/otp-service";

export async function POST(request: Request) {
  try {
    const { email, type, name } = (await request.json()) as {
      email?: string;
      type?: "signup" | "login";
      name?: string;
    };

    if (!email || !type) {
      return NextResponse.json({ error: "Missing email or type" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Reuse existing valid OTP if available to avoid mismatch from rapid re-requests.
    let otp = await getOtp(cleanEmail);
    if (otp) {
      console.log(`📧 Reusing existing valid OTP for ${cleanEmail}`);
    } else {
      otp = generateOtp();
      console.log(`📧 Generated OTP: ${otp} for ${cleanEmail}`);

      // Store OTP in database immediately
      try {
        await storeOtp(cleanEmail, otp, 10); // 10 minute expiry
        console.log(`✓ OTP stored successfully in database for ${cleanEmail}`);
      } catch (storeError) {
        console.error(`❌ CRITICAL: Failed to store OTP in database:`, storeError);
        return NextResponse.json(
          { error: "Failed to store verification code. Database error." },
          { status: 500 },
        );
      }
    }

    // Send email and wait for result to ensure delivery
    try {
      console.log(`📨 Attempting to send email to ${cleanEmail}...`);
      const emailSent = await sendOtpEmail({
        email: cleanEmail,
        otp,
        type,
        name,
      });

      if (emailSent) {
        console.log(`✓ Email successfully sent to ${cleanEmail}`);
        return NextResponse.json({
          success: true,
          message: `Verification code sent to ${cleanEmail}`,
        });
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn(`⚠️ SMTP not configured; continuing in development mode for ${cleanEmail}`);
          return NextResponse.json({
            success: true,
            message: `Development mode: OTP generated for ${cleanEmail}. Use /api/auth/dev-get-otp to fetch it.`,
            devMode: true,
          });
        }
        console.error(`❌ Email send returned false for ${cleanEmail}`);
        return NextResponse.json(
          {
            error: "Failed to send verification code. Please try again.",
            success: false,
          },
          { status: 500 },
        );
      }
    } catch (emailError) {
      console.error(`❌ Exception while sending email to ${cleanEmail}:`, emailError);
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: `Development mode: OTP generated for ${cleanEmail}. Use /api/auth/dev-get-otp to fetch it.`,
          devMode: true,
        });
      }
      return NextResponse.json(
        {
          error: "Failed to send verification code. Please try again.",
          success: false,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Error in send-otp route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
