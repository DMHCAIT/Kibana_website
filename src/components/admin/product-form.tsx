"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Plus,
  Save,
  Loader2,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Product } from "@/types/product";

type Category = { slug: string; name: string };

interface Props {
  product?: Partial<Product> & { id?: string };
  categories: Category[];
  isNew?: boolean;
}

const GENDERS = ["women", "men", "unisex"] as const;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ product, categories, isNew = false }: Props) {
  const router = useRouter();
  const imgInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const productId = product?.id ?? generateId();

  const [form, setForm] = useState({
    id: productId,
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    compareAtPrice: product?.compareAtPrice ?? "",
    image: product?.image ?? "",
    gallery: (product?.gallery as string[]) ?? [],
    video: product?.video ?? "",
    category: product?.category ?? "",
    gender: (product?.gender as string) ?? "women",
    isNew: product?.isNew ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    isTrending: product?.isTrending ?? false,
    inStock: true,
    features: (product?.features as string[]) ?? [],
    specs: (product?.specs as Record<string, string>) ?? {},
    rating: product?.rating ?? 0,
    reviewCount: product?.reviewCount ?? 0,
  });

  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");
  const [uploading, setUploading] = useState<string | null>(null); // 'image' | 'video' | 'gallery'
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }));
  }

  async function uploadFile(
    file: File,
    path: string,
    bucket = "product-images"
  ): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);
    fd.append("path", path);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url!;
  }

  /** Delete a file from Supabase Storage via the upload API (best-effort, non-fatal) */
  async function deleteStorageFile(url: string) {
    if (!url || !url.includes(".supabase.co/storage")) return;
    await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" }).catch(() => {/* non-fatal */});
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("image");
    try {
      const ext = file.name.split(".").pop();
      const oldUrl = form.image;
      const url = await uploadFile(file, `products/${form.id}/main.${ext}`);
      // Delete old image from storage if it was previously uploaded
      if (oldUrl) await deleteStorageFile(oldUrl);
      update("image", url);
      showToast("success", "Main image uploaded");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("video");
    try {
      const ext = file.name.split(".").pop();
      const oldUrl = form.video;
      const url = await uploadFile(
        file,
        `products/${form.id}/video.${ext}`,
        "product-videos"
      );
      // Delete old video from storage if it was previously uploaded
      if (oldUrl) await deleteStorageFile(oldUrl);
      update("video", url);
      showToast("success", "Video uploaded");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading("gallery");
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const url = await uploadFile(
          file,
          `products/${form.id}/gallery-${Date.now()}-${i}.${ext}`
        );
        urls.push(url);
      }
      update("gallery", [...form.gallery, ...urls]);
      showToast("success", `${urls.length} image(s) added to gallery`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  function removeGalleryImage(index: number) {
    const url = form.gallery[index];
    // Delete from Supabase Storage (best-effort)
    deleteStorageFile(url);
    update(
      "gallery",
      form.gallery.filter((_, i) => i !== index)
    );
  }

  function addFeature() {
    if (!newFeature.trim()) return;
    update("features", [...form.features, newFeature.trim()]);
    setNewFeature("");
  }

  function removeFeature(i: number) {
    update(
      "features",
      form.features.filter((_, idx) => idx !== i)
    );
  }

  function addSpec() {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    update("specs", { ...form.specs, [newSpecKey.trim()]: newSpecVal.trim() });
    setNewSpecKey("");
    setNewSpecVal("");
  }

  function removeSpec(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _removed, ...rest } = form.specs;
    update("specs", rest);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) {
      showToast("error", "Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount),
        colors: [],
        colorVariants: [],
      };

      const url = isNew ? "/api/admin/products" : `/api/admin/products/${form.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Save failed");
      }

      showToast("success", isNew ? "Product created!" : "Product saved!");
      setTimeout(() => router.push("/admin/products"), 1000);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Changes will automatically reflect on the website
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors font-medium"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <Card title="Basic Information">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Product Name *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Classic Leather Handbag"
              className={inputClass}
            />
          </Field>
          <Field label="URL Slug *" hint="Used in the product URL">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update("slug", slugify(e.target.value))}
              placeholder="classic-leather-handbag"
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              placeholder="Describe the product..."
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      {/* Pricing */}
      <Card title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹) *">
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
              min={0}
              className={inputClass}
            />
          </Field>
          <Field label="Compare At Price (₹)" hint="Original price for discount display">
            <input
              type="number"
              value={form.compareAtPrice}
              onChange={(e) => update("compareAtPrice", e.target.value)}
              min={0}
              placeholder="Leave blank if no discount"
              className={inputClass}
            />
          </Field>
        </div>
        {form.compareAtPrice && Number(form.compareAtPrice) > form.price && (
          <p className="mt-2 text-sm text-green-600 font-medium">
            {Math.round(((Number(form.compareAtPrice) - form.price) / Number(form.compareAtPrice)) * 100)}% off
          </p>
        )}
      </Card>

      {/* Classification */}
      <Card title="Classification">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className={inputClass}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-4">
          {(
            [
              { key: "isNew", label: "New Arrival" },
              { key: "isBestSeller", label: "Best Seller" },
              { key: "isTrending", label: "Trending" },
              { key: "inStock", label: "In Stock" },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => update(key, !form[key])}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  form[key] ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form[key] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Main Image */}
      <Card title="Main Image">
        <div className="space-y-4">
          {form.image ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image}
                alt="Product"
                className="w-48 h-48 object-cover rounded-xl border border-gray-200"
              />
              <button
                onClick={() => update("image", "")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
            onClick={() => imgInputRef.current?.click()}
          >
            {uploading === "image" ? (
              <Loader2 size={24} className="animate-spin text-gray-400 mx-auto mb-2" />
            ) : (
              <ImageIcon size={24} className="text-gray-400 mx-auto mb-2" />
            )}
            <p className="text-sm text-gray-600 font-medium">
              {uploading === "image" ? "Uploading..." : "Click to upload main image"}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
          </div>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            onChange={handleMainImageUpload}
            className="hidden"
          />

          <Field label="Or enter image URL directly">
            <input
              type="url"
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      {/* Gallery */}
      <Card title="Gallery Images">
        <div className="space-y-4">
          {form.gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {form.gallery.map((url, i) => (
                <div key={i} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    onClick={() => removeGalleryImage(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
            onClick={() => galleryInputRef.current?.click()}
          >
            {uploading === "gallery" ? (
              <Loader2 size={20} className="animate-spin text-gray-400 mx-auto mb-1" />
            ) : (
              <Upload size={20} className="text-gray-400 mx-auto mb-1" />
            )}
            <p className="text-sm text-gray-600">
              {uploading === "gallery" ? "Uploading..." : "Add gallery images"}
            </p>
            <p className="text-xs text-gray-400">Select multiple files</p>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            className="hidden"
          />
        </div>
      </Card>

      {/* Video */}
      <Card title="Product Video">
        <div className="space-y-4">
          {form.video && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <Video size={20} className="text-gray-500 shrink-0" />
              <span className="text-sm text-gray-600 truncate flex-1">{form.video}</span>
              <button
                onClick={() => update("video", "")}
                className="text-red-500 hover:text-red-600 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
            onClick={() => videoInputRef.current?.click()}
          >
            {uploading === "video" ? (
              <Loader2 size={20} className="animate-spin text-gray-400 mx-auto mb-1" />
            ) : (
              <Video size={20} className="text-gray-400 mx-auto mb-1" />
            )}
            <p className="text-sm text-gray-600">
              {uploading === "video" ? "Uploading..." : "Upload product video"}
            </p>
            <p className="text-xs text-gray-400">MP4, WEBM up to 50MB</p>
          </div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />

          <Field label="Or enter video URL">
            <input
              type="url"
              value={form.video}
              onChange={(e) => update("video", e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      {/* Features */}
      <Card title="Features">
        <div className="space-y-3">
          {form.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                {feat}
              </span>
              <button
                onClick={() => removeFeature(i)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFeature()}
              placeholder="Add a feature..."
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={addFeature}
              className="px-3 py-2 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* Specs */}
      <Card title="Specifications">
        <div className="space-y-3">
          {Object.entries(form.specs).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-1/3 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 truncate">
                {key}
              </span>
              <span className="flex-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                {val}
              </span>
              <button
                onClick={() => removeSpec(key)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="Key (e.g. Material)"
              className={`${inputClass} w-1/3`}
            />
            <input
              type="text"
              value={newSpecVal}
              onChange={(e) => setNewSpecVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSpec()}
              placeholder="Value (e.g. Genuine Leather)"
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={addSpec}
              className="px-3 py-2 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* Display & Rating */}
      <Card title="Display & Rating">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Rating (0–5)">
            <input
              type="number"
              value={form.rating}
              onChange={(e) => update("rating", Number(e.target.value))}
              min={0}
              max={5}
              step={0.1}
              className={inputClass}
            />
          </Field>
          <Field label="Review Count">
            <input
              type="number"
              value={form.reviewCount}
              onChange={(e) => update("reviewCount", Number(e.target.value))}
              min={0}
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      {/* Save Button (bottom) */}
      <div className="flex justify-end gap-3 pb-6">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors font-medium"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}

// --- Helpers ---

const inputClass =
  "w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="text-xs text-gray-400 font-normal ml-1.5">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
