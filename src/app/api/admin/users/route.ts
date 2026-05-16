import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUsers, recordUserLogin } from "@/lib/server-data";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = (await getUsers()).sort(
    (a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
  );
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  // Public endpoint — called when a user logs in on the storefront
  const body = await req.json();
  if (!body.id || !body.phone) {
    return NextResponse.json({ error: "id and phone required" }, { status: 400 });
  }
  await recordUserLogin({ id: body.id, name: body.name ?? "—", phone: body.phone });
  return NextResponse.json({ success: true });
}
