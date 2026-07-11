import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { mediaFiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function isAuthenticated(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore.get("admin_token")?.value === "authenticated";
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;  // 10 MB
const VIDEO_SIZE_LIMIT = 50 * 1024 * 1024;  // 50 MB

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!isAuthenticated(cookieStore)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string | null) ?? "product-images";
    const path = formData.get("path") as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: "Missing file or path" }, { status: 400 });
    }

    // Validate type and size
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV` },
        { status: 400 },
      );
    }

    const sizeLimit = isVideo ? VIDEO_SIZE_LIMIT : IMAGE_SIZE_LIMIT;
    if (file.size > sizeLimit) {
      const limitMB = sizeLimit / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Max size for ${isVideo ? "videos" : "images"} is ${limitMB} MB` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    // If image, generate resized variants (best-effort). We'll create multiple widths.
    const variants: Array<{ width: number; url: string }> = [];
    try {
      const isImageType = isImage && !isVideo;
      if (isImageType) {
        const widths = [320, 640, 1280];
        const ext = path.split(".").pop() ?? "jpg";
        const base = path.replace(/\.[^/.]+$/, "");
        for (const w of widths) {
          try {
            const resized = await sharp(buffer).resize({ width: w }).toBuffer();
            const resizedPath = `${base}-${w}.${ext}`;
            const { error: re } = await supabase.storage.from(bucket).upload(resizedPath, resized, {
              contentType: file.type,
              upsert: true,
            });
            if (re) continue;
            const { data: rdata } = supabase.storage.from(bucket).getPublicUrl(resizedPath);
            variants.push({ width: w, url: rdata.publicUrl });
          } catch (e) {
            // ignore per-variant errors
            console.error("Variant resize error:", e);
          }
        }
      }
    } catch (e) {
      // non-fatal
      console.error("Image variant creation error:", e);
    }

    // Save file metadata to database
    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      await db.insert(mediaFiles).values({
        id: fileId,
        name: file.name,
        url: publicUrl,
        bucket,
        path,
        type: isVideo ? "video" : "image",
        size: file.size,
      });
    } catch (e) {
      // Non-fatal: file is already uploaded to storage; DB record can be re-synced
      console.error("Media file DB insert error:", e);
    }

    return NextResponse.json({ url: publicUrl, id: fileId, variants });
  } catch (err) {
    console.error("Upload endpoint error:", err);
    return NextResponse.json(
      { error: `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/upload?url=<publicUrl>
// Deletes a file from Supabase Storage and removes its media_files record.
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!isAuthenticated(cookieStore)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    // Extract bucket and path from Supabase public URL:
    // https://{ref}.supabase.co/storage/v1/object/public/{bucket}/{path...}
    let bucket: string;
    let storagePath: string;
    try {
      const parsed = new URL(url);
      // pathname: /storage/v1/object/public/{bucket}/{path}
      const segments = parsed.pathname.split("/");
      // segments[0]="" [1]="storage" [2]="v1" [3]="object" [4]="public" [5]=bucket [6..]=path
      if (segments[4] !== "public" || !segments[5]) throw new Error("Not a Supabase storage URL");
      bucket = segments[5];
      storagePath = segments.slice(6).join("/");
      if (!storagePath) throw new Error("Empty path");
    } catch {
      return NextResponse.json({ error: "Invalid Supabase storage URL" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    const { error: storageError } = await supabase.storage.from(bucket).remove([storagePath]);
    if (storageError) {
      console.error("Supabase delete error:", storageError);
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    // Best-effort: remove the media_files record (ignore if not found)
    try {
      await db.delete(mediaFiles).where(eq(mediaFiles.url, url));
    } catch (e) {
      // Non-fatal
      console.error("Media file DB delete error:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete endpoint error:", err);
    return NextResponse.json(
      { error: `Delete failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
