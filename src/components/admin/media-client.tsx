"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Search, Copy, Check, ExternalLink } from "lucide-react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import type { MediaFile } from "@/types/media";

interface Props {
  initialMedia: MediaFile[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function MediaClient({ initialMedia }: Props) {
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [bucket, setBucket] = useState<"product-images" | "product-videos">("product-images");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = media
    .filter((m) => {
      if (m.bucket !== bucket) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.path.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      let successCount = 0;

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);
        formData.append("path", `uploads/${Date.now()}-${file.name}`);

        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (res.ok) {
            const data = (await res.json()) as { url?: string };
            if (data.url) {
              // Add to media list
              const newMedia: MediaFile = {
                id: `media-${Date.now()}`,
                name: file.name,
                url: data.url,
                bucket,
                path: `uploads/${Date.now()}-${file.name}`,
                type: bucket === "product-videos" ? "video" : "image",
                size: file.size,
                uploadedAt: new Date().toISOString(),
              };
              setMedia((prev) => [newMedia, ...prev]);
              successCount++;
            }
          } else {
            const error = (await res.json()) as { error?: string };
            setUploadError(error.error || `Failed to upload ${file.name}`);
          }
        } catch (err) {
          setUploadError(
            `Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
          );
        }
      }

      if (successCount > 0) {
        setUploadSuccess(true);
        // Auto-close success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 5000);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteMedia(mediaId: string, url: string) {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      }
    } catch (err) {
      console.error("Failed to delete media", err);
    }
  }

  function copyToClipboard(text: string, mediaId: string) {
    navigator.clipboard.writeText(text);
    setCopied(mediaId);
    setTimeout(() => setCopied(null), 2000);
  }

  const totalSize = filtered.reduce((sum, m) => sum + m.size, 0);
  const imageCount = filtered.filter((m) => m.type === "image").length;
  const videoCount = filtered.filter((m) => m.type === "video").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Total Files</div>
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Images</div>
          <div className="text-2xl font-bold text-blue-600">{imageCount}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Videos</div>
          <div className="text-2xl font-bold text-purple-600">{videoCount}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Total Size</div>
          <div className="text-2xl font-bold text-green-600">{formatSize(totalSize)}</div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Media Library</h2>
          <div className="text-xs text-gray-500">{filtered.length} files</div>
        </div>

        {/* Success Message with Redirect */}
        {uploadSuccess && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
            <div>
              <p className="font-medium text-green-900">✓ Upload successful!</p>
              <p className="text-sm text-green-700">Your images have been uploaded successfully.</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="ml-4 flex items-center gap-2 whitespace-nowrap rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <ExternalLink size={16} />
              Visit Website
            </button>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
            <div>
              <p className="font-medium text-red-900">✗ Upload failed</p>
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="ml-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Bucket Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setBucket("product-images")}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              bucket === "product-images"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setBucket("product-videos")}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              bucket === "product-videos"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Videos
          </button>
        </div>

        {/* Upload Section */}
        <div>
          <label className="block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Upload size={32} />
              <div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">
                  {bucket === "product-videos" ? "MP4, WebM" : "PNG, JPG, WebP"} up to 100MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={bucket === "product-videos" ? "video/*" : "image/*"}
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-700">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              <p className="text-sm font-medium">Uploading files...</p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name or path..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              <p>No files found</p>
            </div>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                className="overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-lg"
              >
                {/* Thumbnail */}
                <div className="group relative h-40 w-full overflow-hidden bg-gray-100">
                  {file.type === "image" ? (
                    <ResponsiveImage
                      src={file.url}
                      alt={file.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-sm text-gray-500">Video File</span>
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteMedia(file.id, file.url)}
                    className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-2 p-3">
                  <div>
                    <h3 className="truncate text-sm font-medium text-gray-900">{file.name}</h3>
                    <p className="truncate text-xs text-gray-500">{file.path}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{formatSize(file.size)}</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>

                  {/* Copy URL */}
                  <button
                    onClick={() => copyToClipboard(file.url, file.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
                  >
                    {copied === file.id ? (
                      <>
                        <Check size={14} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
