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
    // Check if request has a body
    const contentLength = request.headers.get("content-length");
    if (!contentLength || contentLength === "0") {
      return NextResponse.json({ success: false, message: "Empty request body" }, { status: 200 });
    }

    let eventData;
    try {
      eventData = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 200 },
      );
    }

    const { eventName, data, timestamp } = eventData;

    // Validate required environment variables
    if (!META_ACCESS_TOKEN) {
      // Return 200 with success: false for graceful degradation (analytics non-critical)
      return NextResponse.json(
        { success: false, message: "Conversions API not configured" },
        { status: 200 },
      );
    }

    if (!PIXEL_ID) {
      // Return 200 with success: false for graceful degradation (analytics non-critical)
      return NextResponse.json(
        { success: false, message: "Pixel ID not configured" },
        { status: 200 },
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
    if (data.value !== undefined && data.value !== null) {
      customData.value = parseFloat(String(data.value));
    }
    if (data.currency) customData.currency = data.currency;
    if (data.order_id) customData.order_id = data.order_id;
    if (data.num_items) customData.num_items = data.num_items;
    if (data.content_type) customData.content_type = data.content_type;
    if (data.content_ids) customData.content_ids = data.content_ids;
    if (data.content_name) customData.content_name = data.content_name;
    if (data.content_id) customData.content_id = data.content_id;
    if (data.payment_method) customData.payment_method = data.payment_method;

    // Validate required fields for Purchase events
    if (eventName === "Purchase") {
      if (!customData.value) {
        return NextResponse.json(
          { success: false, error: "Purchase event requires 'value' field" },
          { status: 400 },
        );
      }
      if (!customData.currency) {
        return NextResponse.json(
          { success: false, error: "Purchase event requires 'currency' field" },
          { status: 400 },
        );
      }
      if (!customData.content_type) {
        return NextResponse.json(
          { success: false, error: "Purchase event requires 'content_type' field" },
          { status: 400 },
        );
      }
      const contentIdsStr = String(customData.content_ids || "").trim();
      if (!contentIdsStr) {
        return NextResponse.json(
          { success: false, error: "Purchase event requires 'content_ids' field" },
          { status: 400 },
        );
      }
    }

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

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversionsData),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || "Unknown error from Meta API",
          errorType: result.error?.type,
          errorCode: result.error?.code,
          details: result,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
