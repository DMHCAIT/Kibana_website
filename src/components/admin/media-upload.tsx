"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon, Video, Link2 } from "lucide-react";

type UploadMode = "url" | "file";

interface MediaUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket: "product-images" | "product-videos" | "category-images" | "site-assets";
  /** Storage path inside the bucket, e.g. "p1/main.jpg" */
  storagePath: string;
  type?: "image" | "video";
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export function MediaUpload({
  label,
  value,
  onChange,
  bucket,
  storagePath,
  type = "image",
  hint,
  required,
  placeholder,
}: MediaUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<UploadMode>("url");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = type === "video"
    ? "video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/gif";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    // Build unique storage path using timestamp to avoid cache stale
    const ext = file.name.split(".").pop() ?? (type === "video" ? "mp4" : "jpg");
    const ts = Date.now();
    const finalPath = storagePath.includes("{ts}")
      ? storagePath.replace("{ts}", String(ts))
      : `${storagePath.replace(/\.[^.]+$/, "")}-${ts}.${ext}`;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);
    fd.append("path", finalPath);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        onChange(data.url);
        setMode("url");
      }
    } catch {
      setError("Upload failed — check your network connection");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const Icon = type === "video" ? Video : ImageIcon;

  return (
    <div>
      {/* Label + mode switcher */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
              mode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Link2 className="h-3 w-3" /> URL
          </button>
          <button
            type="button"
            onClick={() => { setMode("file"); setTimeout(() => fileRef.current?.click(), 50); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
              mode === "file" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Upload className="h-3 w-3" /> Upload
          </button>
        </div>
      </div>

      {/* URL input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          placeholder={placeholder ?? (type === "video" ? "https://... or upload a video" : "/extracted/img-001.jpg or upload")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors pr-20"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Upload area (shown when file mode is active or when dragging) */}
      <div
        className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors group"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dt = new DataTransfer();
          const dropped = e.dataTransfer.files[0];
          if (dropped) {
            dt.items.add(dropped);
            const input = fileRef.current!;
            input.files = dt.files;
            const event = new Event("change", { bubbles: true });
            input.dispatchEvent(event);
            handleFile({ target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            <p className="text-xs text-gray-500">Uploading to Supabase Storage…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <Icon className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            <p className="text-xs text-gray-400 group-hover:text-gray-600">
              Click or drag & drop to upload {type === "video" ? "video" : "image"}
            </p>
            <p className="text-[10px] text-gray-300">
              {type === "video" ? "MP4, WEBM, MOV — max 200 MB" : "JPEG, PNG, WEBP — max 10 MB"}
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
          <X className="h-3 w-3" /> {error}
        </p>
      )}

      {/* Hint */}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── GalleryUpload ─────────────────────────────────────────────────────────────
// For uploading multiple images into a gallery (adds to the array)

interface GalleryUploadProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: "product-images" | "product-videos" | "category-images" | "site-assets";
  /** Base path — files will be stored as {basePath}-{index}-{ts}.{ext} */
  basePath: string;
  hint?: string;
}

export function GalleryUpload({ label, value, onChange, bucket, basePath, hint }: GalleryUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setUrlInput("");
    }
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const handleFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const ts = Date.now() + newUrls.length;
      const path = `${basePath}-gallery-${ts}.${ext}`;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      fd.append("path", path);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok) newUrls.push(data.url);
        else setError(data.error ?? "Upload failed");
      } catch {
        setError("Upload failed");
      }
    }
    if (newUrls.length) onChange([...value, ...newUrls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>

      {/* URL add row */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={urlInput}
          placeholder="Paste image URL and press Add"
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        />
        <button
          type="button"
          onClick={addUrl}
          className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          Add URL
        </button>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors group"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 py-1">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            <p className="text-xs text-gray-500">Uploading…</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            <Upload className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
            <p className="text-xs text-gray-400 group-hover:text-gray-600">
              Click or drag images to add to gallery (multi-select supported)
            </p>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}

      {/* Gallery grid */}
      {value.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {value.map((src, i) => (
            <div key={i} className="relative group/img">
              <img src={src} alt="" className="h-16 w-16 rounded-lg border object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover/img:flex shadow text-[10px]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
