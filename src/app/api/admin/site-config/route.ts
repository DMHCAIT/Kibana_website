import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteConfig, saveSiteConfig } from "@/lib/server-data";
import type { SiteConfig } from "@/lib/server-data";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getSiteConfig());
}

export async function PUT(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as SiteConfig;
  await saveSiteConfig(body);
  return NextResponse.json({ success: true });
}
