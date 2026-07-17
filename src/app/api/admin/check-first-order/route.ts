import { NextResponse } from "next/server";
import { isFirstTimeCustomer } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail");

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "userId and userEmail required" }, { status: 400 });
    }

    // ⚡ Check if customer is placing their first order
    const isFirst = await isFirstTimeCustomer(userId, userEmail);

    return NextResponse.json({ isFirstTime: isFirst });
  } catch (error) {
    console.error("❌ Error checking first-time customer:", error);
    return NextResponse.json({ error: "Failed to check customer status" }, { status: 500 });
  }
}
