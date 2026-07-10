"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, Search, Copy, Check } from "lucide-react";
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
  const [media, setMedia] = useState(initialMedia);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [bucket, setBucket] = useState<"product-images" | "product-videos">(
    "product-images"
  );
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
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);
        formData.append("path", `uploads/${Date.now()}-${file.name}`);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
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
          }
        }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Files</div>
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Images</div>
          <div className="text-2xl font-bold text-blue-600">{imageCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Videos</div>
          <div className="text-2xl font-bold text-purple-600">{videoCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Size</div>
          <div className="text-2xl font-bold text-green-600">{formatSize(totalSize)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Media Library</h2>
          <div className="text-xs text-gray-500">{filtered.length} files</div>
        </div>

        {/* Bucket Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setBucket("product-images")}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
              bucket === "product-images"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setBucket("product-videos")}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
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
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors text-center">
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
            <p className="text-sm text-blue-600 mt-2 text-center">Uploading files...</p>
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
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No files found</p>
            </div>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-40 bg-gray-100 overflow-hidden group">
                  {file.type === "image" ? (
                    <ResponsiveImage
                      src={file.url}
                      alt={file.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500 text-sm">Video File</span>
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteMedia(file.id, file.url)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm truncate">{file.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{file.path}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{formatSize(file.size)}</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>

                  {/* Copy URL */}
                  <button
                    onClick={() => copyToClipboard(file.url, file.id)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
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
