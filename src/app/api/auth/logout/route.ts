import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the kibana-user-id cookie
  response.cookies.set({
    name: "kibana-user-id",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // This deletes the cookie
    path: "/",
  });

  return response;
}
