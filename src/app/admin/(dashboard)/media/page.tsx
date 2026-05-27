"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  size: number;
  bucket: string;
  path: string;
  uploadedAt: string;
}

const BUCKETS = [
  { value: "product-images", label: "Product Images" },
  { value: "product-videos", label: "Product Videos" },
  { value: "site-media", label: "Site Media (Hero, Banners)" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [bucket, setBucket] = useState("product-images");
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = (await res.json()) as MediaFile[];
        setFiles(data);
      }
    } catch {
      showToast("error", "Failed to load media files");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);

  async function uploadFile(file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${Date.now()}-${safeName}`;
    const isVideo = file.type.startsWith("video/");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", isVideo ? "product-videos" : bucket);
    fd.append("path", path);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = (await res.json()) as { url?: string; id?: string; error?: string };

    if (!res.ok) throw new Error(data.error ?? "Upload failed");

    await fetchFiles();
    return data.url!;
  }

  async function handleFiles(fileList: FileList) {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    setUploading(true);
    let successCount = 0;
    const errors: string[] = [];

    for (const file of arr) {
      try {
        await uploadFile(file);
        successCount++;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Upload failed");
      }
    }

    setUploading(false);
    if (successCount > 0) {
      showToast("success", `${successCount} file(s) uploaded successfully`);
    }
    if (errors.length > 0) {
      showToast("error", errors[0]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function deleteFile(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setFiles((prev) => prev.filter((f) => f.id !== id));
      showToast("success", "File deleted from storage and database");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-80 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All uploads are stored in Supabase and tracked in the database
          </p>
        </div>
        <button
          onClick={() => void fetchFiles()}
          className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Upload Files</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Upload to:</label>
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              {BUCKETS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragging
              ? "border-gray-900 bg-gray-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <Upload size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Images: JPG, PNG, WEBP (max 10MB) &nbsp;·&nbsp; Videos: MP4, WEBM (max 50MB)
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* All Media Files from DB */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Media Files</h2>
          <span className="text-sm text-gray-400">
            {loading ? "Loading…" : `${files.length} file(s)`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ImageIcon size={36} className="mb-3 opacity-40" />
            <p className="text-sm">No files uploaded yet</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 bg-gray-50 rounded-xl border border-gray-200 p-3"
              >
                {/* Preview */}
                <div className="shrink-0">
                  {file.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Video size={24} className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {file.type === "image" ? (
                      <ImageIcon size={11} className="inline mr-1" />
                    ) : (
                      <Video size={11} className="inline mr-1" />
                    )}
                    {file.type} · {formatSize(file.size)} · {file.bucket}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <LinkIcon size={11} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500 truncate font-mono">{file.url}</span>
                  </div>
                </div>

                {/* Copy URL */}
                <button
                  onClick={() => void copyUrl(file.url)}
                  className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    copied === file.url
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-gray-300 hover:bg-white text-gray-600"
                  }`}
                >
                  {copied === file.url ? (
                    <><CheckCircle size={13} /> Copied!</>
                  ) : (
                    <><Copy size={13} /> Copy URL</>
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => void deleteFile(file.id)}
                  disabled={deleting === file.id}
                  className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete from storage and database"
                >
                  {deleting === file.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-800">
        <p className="font-semibold mb-1">How to use uploaded media</p>
        <ul className="space-y-1 text-blue-700 text-xs list-disc list-inside">
          <li>Copy the URL after upload and paste it into any product image/video field</li>
          <li>For hero banners and homepage content, go to <strong>Content</strong></li>
          <li>For product images, go to <strong>Products → Edit Product</strong></li>
          <li>Deleting a file removes it from both Supabase Storage and the database</li>
        </ul>
      </div>
    </div>
  );
}
