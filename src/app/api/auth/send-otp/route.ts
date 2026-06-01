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
    console.log(`✓ OTP stored in database for ${cleanEmail}`);

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
          message: `Verification code sent to ${cleanEmail}`
        });
      } else {
        console.error(`❌ Email send returned false for ${cleanEmail}`);
        return NextResponse.json(
          { 
            error: "Failed to send verification code. Please try again.",
            success: false
          },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error(`❌ Exception while sending email to ${cleanEmail}:`, emailError);
      return NextResponse.json(
        { 
          error: "Failed to send verification code. Please try again.",
          success: false
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-otp route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
