import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authenticated";
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// GET /api/admin/media — list all media files via Supabase REST API
export async function GET() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("media_files")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch media files" }, { status: 500 });
  }
}

// DELETE /api/admin/media?id=<id> — delete from Supabase storage + DB
export async function DELETE(req: Request) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = getSupabase();

  // Fetch the record via REST API
  const { data: rows } = await supabase
    .from("media_files")
    .select("*")
    .eq("id", id)
    .single();
  if (!rows) return NextResponse.json({ error: "File not found" }, { status: 404 });

  // Delete from Supabase storage
  const { error: storageError } = await supabase.storage
    .from(rows.bucket)
    .remove([rows.path]);

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  // Delete from database via REST API
  await supabase.from("media_files").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
