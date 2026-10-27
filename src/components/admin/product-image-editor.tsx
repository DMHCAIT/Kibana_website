"use client";

import { useState } from "react";
import Image from "@/components/ui/image";
import { orderedProductImages } from "@/lib/product-presentation";

type Props = {
  images: string[];
  path: string;
  onChange: (images: string[]) => void;
  onBusy: (busy: boolean) => void;
};

export function ProductImageEditor({ images, path, onChange, onBusy }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setError("");
    setUploading(true);
    onBusy(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("bucket", "product-images");
        data.append(
          "path",
          `${path}/${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`,
        );
        const response = await fetch("/api/admin/upload", { method: "POST", body: data });
        const result = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !result.url)
          throw new Error(result.error || `Upload failed for ${file.name}.`);
        uploaded.push(result.url);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      if (uploaded.length) onChange(orderedProductImages("", [...images, ...uploaded]));
      setUploading(false);
      onBusy(false);
      input.value = "";
    }
  }

  function move(index: number, offset: number) {
    const next = [...images];
    const destination = index + offset;
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        First image: product card, gallery cover and colour swatch. Second image: hover. Upload in
        order or use the arrows to reorder. Save Product to publish.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((url, index) => (
          <div key={url} className="space-y-2 rounded border p-2">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <p className="text-xs">
              {index === 0
                ? "1. Main / colour"
                : index === 1
                  ? "2. Hover"
                  : `${index + 1}. Gallery`}
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                disabled={uploading || index === 0}
                onClick={() => move(index, -1)}
                aria-label={`Move image ${index + 1} earlier`}
                className="rounded border px-2 py-1 disabled:opacity-30"
              >
                Earlier
              </button>
              <button
                type="button"
                disabled={uploading || index === images.length - 1}
                onClick={() => move(index, 1)}
                aria-label={`Move image ${index + 1} later`}
                className="rounded border px-2 py-1 disabled:opacity-30"
              >
                Later
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="rounded border px-2 py-1 text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="block rounded border border-dashed p-4 text-sm">
        {uploading
          ? "Uploading images..."
          : "Upload images (JPEG, PNG, WebP, GIF; up to 10 MB each)"}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={upload}
          disabled={uploading}
          className="mt-2 block w-full"
        />
      </label>
    </div>
  );
}
