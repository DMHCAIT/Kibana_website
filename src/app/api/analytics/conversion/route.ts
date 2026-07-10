import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * SHA-256 hash function for user data
 * Required by Meta Conversions API for PII (Personally Identifiable Information)
 */
async function hashSHA256(value: string): Promise<string> {
  if (!value) return "";
  // Normalize the value (trim, lowercase for emails)
  const normalized = value.trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * POST /api/analytics/conversion
 * 
 * Server-side event tracking for Meta Conversions API
 * This provides more reliable conversion tracking as it's not affected by:
 * - Ad blockers
 * - Browser privacy settings
 * - Network issues
 */
export async function POST(request: NextRequest) {
  try {
    const { eventName, data, timestamp } = await request.json();

    // Validate required environment variables
    if (!META_ACCESS_TOKEN) {
      console.warn(
        "Meta Conversions API Token not configured. Set META_CONVERSIONS_API_TOKEN in .env.local"
      );
      return NextResponse.json(
        { success: false, message: "Conversions API not configured" },
        { status: 400 }
      );
    }

    if (!PIXEL_ID) {
      console.warn("Meta Pixel ID not configured");
      return NextResponse.json(
        { success: false, message: "Pixel ID not configured" },
        { status: 400 }
      );
    }

    // Hash sensitive user data (required by Meta)
    const hashedUserData: Record<string, string> = {};

    if (data.email) {
      hashedUserData.em = await hashSHA256(data.email);
    }
    if (data.phone) {
      hashedUserData.ph = await hashSHA256(data.phone);
    }
    if (data.firstName) {
      hashedUserData.fn = await hashSHA256(data.firstName);
    }
    if (data.lastName) {
      hashedUserData.ln = await hashSHA256(data.lastName);
    }
    if (data.city) {
      hashedUserData.ct = await hashSHA256(data.city);
    }
    if (data.state) {
      hashedUserData.st = await hashSHA256(data.state);
    }
    if (data.zipCode) {
      hashedUserData.zp = await hashSHA256(data.zipCode);
    }

    // Build custom data
    const customData: Record<string, unknown> = {};
    if (data.value) customData.value = data.value;
    if (data.currency) customData.currency = data.currency;
    if (data.order_id) customData.order_id = data.order_id;
    if (data.num_items) customData.num_items = data.num_items;

    // Build Conversions API payload
    const conversionsData = {
      data: [
        {
          event_name: eventName,
          event_time: timestamp || Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: hashedUserData,
          custom_data: customData,
          event_source_url: request.headers.get("referer") || "",
        },
      ],
      test_event_code: process.env.NODE_ENV === "development" ? "TEST12345" : undefined,
    };

    // Remove test_event_code if in production
    if (process.env.NODE_ENV === "production") {
      delete conversionsData.test_event_code;
    }

    console.log(`📊 Meta Conversion Event: ${eventName}`, {
      timestamp,
      hashedUserDataKeys: Object.keys(hashedUserData),
      customData,
    });

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversionsData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta API Error:", result);
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || "Unknown error",
          details: result,
        },
        { status: response.status }
      );
    }

    console.log(`✅ Conversion tracked: ${eventName}`, result);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Conversions API error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
