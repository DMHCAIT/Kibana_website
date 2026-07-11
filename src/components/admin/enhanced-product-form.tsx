"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
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

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EnhancedProductForm({ product, categories, isNew = false }: Props) {
  const router = useRouter();
  const imgInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const productId = product?.id ?? generateId();

  const extractColorVariants = () => {
    const variants = (product?.colorVariants ?? []) as Array<{
      color?: string;
      slug?: string;
      image?: string;
      gallery?: string[];
      productTitle?: string;
      stockQty?: number;
      inStock?: boolean;
      hex?: string;
    }>;
    return variants.map((v) => {
      const isHexCode = v.color?.startsWith("#");
      const displayName = isHexCode ? slugToName(v.slug ?? "") : v.color ?? "";
      return {
        color: displayName,
        slug: v.slug ?? "",
        image: v.image || "",
        gallery: v.gallery || [],
        productTitle: v.productTitle || "",
        stockQty: v.stockQty || 0,
        inStock: v.inStock !== undefined ? v.inStock : true,
        hex: v.hex || (isHexCode ? v.color : undefined),
      };
    });
  };

  const [form, setForm] = useState({
    id: productId,
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    compareAtPrice: product?.compareAtPrice ?? "",
    image: product?.image ?? "",
    gallery: (product?.gallery as string[]) ?? [],
    colors: (product?.colors as string[]) ?? [],
    colorVariants: extractColorVariants(),
    video: product?.video ?? "",
    category: product?.category ?? "",
    gender: (product?.gender as string) ?? "women",
    isNew: product?.isNew ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    isTrending: product?.isTrending ?? false,
    features: (product?.features as string[]) ?? [],
    specs: (product?.specs as Record<string, string>) ?? {},
    rating: product?.rating ?? 0,
    reviewCount: product?.reviewCount ?? 0,
  });

  const [newFeature, setNewFeature] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }));
    setSaved(false);
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

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      if (!data.url) {
        throw new Error("Upload successful but no URL returned");
      }

      return data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);
      throw new Error(message);
    }
  }

  async function deleteStorageFile(url: string) {
    try {
      await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });
    } catch {
      // Non-fatal
    }
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("image");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const url = await uploadFile(file, `products/${form.id}/main.${ext}`);
      update("image", url);
      showToast("success", "Main image uploaded");
      await autoSave();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading("gallery");
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const url = await uploadFile(
          file,
          `products/${form.id}/gallery-${Date.now()}-${i}.${ext}`
        );
        urls.push(url);
      }
      update("gallery", [...form.gallery, ...urls]);
      showToast("success", `${urls.length} image(s) added`);
      await autoSave();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  async function handleVariantImageUpload(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`variant-image-${index}`);
    try {
      const variant = form.colorVariants[index];
      const ext = file.name.split(".").pop() || "jpg";
      const url = await uploadFile(
        file,
        `products/${form.id}/variants/${variant.slug}/main.${ext}`
      );
      const updated = [...form.colorVariants];
      updated[index] = { ...updated[index], image: url };
      update("colorVariants", updated);
      showToast("success", "Variant image updated");
      await autoSave();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function handleVariantGalleryUpload(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;
    if (!files) return;
    setUploading(`variant-gallery-${index}`);
    try {
      const variant = form.colorVariants[index];
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const url = await uploadFile(
          file,
          `products/${form.id}/variants/${variant.slug}/gallery-${Date.now()}-${i}.${ext}`
        );
        urls.push(url);
      }
      const updated = [...form.colorVariants];
      const prevGallery = updated[index].gallery ?? [];
      updated[index] = {
        ...updated[index],
        gallery: [...prevGallery, ...urls],
      };
      update("colorVariants", updated);
      showToast("success", `${urls.length} image(s) added`);
      await autoSave();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function autoSave() {
    if (!form.name.trim() || !form.slug.trim()) return;
    try {
      // Auto-generate colors from colorVariants if colors is empty
      const colors = form.colors && form.colors.length > 0 
        ? form.colors 
        : form.colorVariants.map(v => v.hex || v.color).filter(Boolean);

      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount),
        colors,
        colorVariants: form.colorVariants,
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

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await autoSave();
      showToast("success", "Product saved successfully");
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function toggleVariantStock(index: number) {
    const updated = [...form.colorVariants];
    updated[index] = { ...updated[index], inStock: !updated[index].inStock };
    update("colorVariants", updated);
  }

  function removeGalleryImage(index: number) {
    const updated = form.gallery.filter((_, i) => i !== index);
    update("gallery", updated);
  }

  function removeVariantGalleryImage(variantIndex: number, imageIndex: number) {
    const updated = [...form.colorVariants];
    updated[variantIndex] = {
      ...updated[variantIndex],
      gallery: updated[variantIndex].gallery.filter((_, i) => i !== imageIndex),
    };
    update("colorVariants", updated);
  }

  function removeVariant(index: number) {
    const updated = form.colorVariants.filter((_, i) => i !== index);
    update("colorVariants", updated);
  }

  const toastBg =
    toast?.type === "success"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 border rounded-lg p-4 ${toastBg} flex items-center gap-2 z-50`}>
          {toast.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 bg-white z-40 p-4 -mx-8 px-8 border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Create Product" : "Edit Product"}
        </h1>
        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Product
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <CheckCircle size={18} />
          Auto-saved successfully
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Valera Dome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., valera-dome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Product description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compare At Price (₹)</label>
            <input
              type="number"
              value={form.compareAtPrice}
              onChange={(e) => update("compareAtPrice", e.target.value ? Number(e.target.value) : "")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => update("isNew", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Mark as New</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => update("isBestSeller", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Best Seller</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isTrending}
              onChange={(e) => update("isTrending", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Trending</span>
          </label>
        </div>
      </section>

      {/* Product Images */}
      <section className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>

        {/* Main Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image *</label>
          {form.image && (
            <div className="mb-3 relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200">
              <ResponsiveImage src={form.image} alt="Main" fill className="object-cover" priority />
              <button
                type="button"
                onClick={() => {
                  deleteStorageFile(form.image);
                  update("image", "");
                }}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <ImageIcon size={24} />
              <span className="text-sm font-medium">Click to upload main image</span>
              <span className="text-xs text-gray-500">(This shows on product listing)</span>
            </div>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              disabled={uploading === "image"}
              className="hidden"
            />
          </label>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {form.gallery.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                <ResponsiveImage src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <ImageIcon size={24} />
              <span className="text-sm font-medium">Click to add gallery images</span>
              <span className="text-xs text-gray-500">(Multiple images for product detail page)</span>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryUpload}
              disabled={uploading === "gallery"}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* Color Variants & Stock Control */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Color Variants & Stock Control</h2>
        <p className="text-sm text-gray-600">Toggle stock status for each color variant. When OFF, it will display "Out of Stock" for that variant.</p>

        <div className="space-y-3">
          {form.colorVariants.map((variant, index) => (
            <div key={variant.slug} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setExpandedVariant(expandedVariant === variant.slug ? null : variant.slug)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {variant.image && (
                    <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden">
                      <ResponsiveImage
                        src={variant.image}
                        alt={variant.color}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{variant.color}</p>
                    <p className="text-xs text-gray-500">{variant.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVariantStock(index);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium transition-colors"
                  >
                    {variant.inStock ? (
                      <>
                        <ToggleRight className="text-green-600" size={18} />
                        <span className="text-green-600">In Stock</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="text-red-600" size={18} />
                        <span className="text-red-600">Out of Stock</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </button>

              {expandedVariant === variant.slug && (
                <div className="px-4 pb-4 border-t border-gray-200 space-y-4">
                  {/* Variant Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variant Image</label>
                    {variant.image && (
                      <div className="mb-3 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <ResponsiveImage
                          src={variant.image}
                          alt={variant.color}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...form.colorVariants];
                            updated[index] = { ...updated[index], image: "" };
                            update("colorVariants", updated);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <label className="block border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="flex items-center justify-center text-gray-600">
                        <ImageIcon size={18} />
                      </div>
                      <span className="text-xs text-center text-gray-600">Upload variant image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVariantImageUpload(index, e)}
                        disabled={uploading?.includes("variant-image")}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Variant Gallery */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variant Gallery</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {variant.gallery?.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded border border-gray-200 group">
                          <ResponsiveImage src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removeVariantGalleryImage(index, i)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="block border-2 border-dashed border-gray-300 rounded-lg p-2 cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="flex items-center justify-center text-gray-600">
                        <Plus size={16} />
                      </div>
                      <span className="text-xs text-center text-gray-600">Add gallery images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleVariantGalleryUpload(index, e)}
                        disabled={uploading?.includes("variant-gallery")}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Product Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Title (Display Name)</label>
                    <input
                      type="text"
                      value={variant.productTitle || ""}
                      onChange={(e) => {
                        const updated = [...form.colorVariants];
                        updated[index] = {
                          ...updated[index],
                          productTitle: e.target.value,
                        };
                        update("colorVariants", updated);
                      }}
                      placeholder={`e.g., Lekha Envelope Vegan Leather Zip Around Women's Wallet - [${variant.color}]`}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use product name with color</p>
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={variant.stockQty ?? 0}
                      onChange={(e) => {
                        const updated = [...form.colorVariants];
                        updated[index] = {
                          ...updated[index],
                          stockQty: Number(e.target.value),
                        };
                        update("colorVariants", updated);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features & Specs */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Features & Specifications</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div className="space-y-2 mb-2">
            {form.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const updated = [...form.features];
                    updated[i] = e.target.value;
                    update("features", updated);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = form.features.filter((_, j) => j !== i);
                    update("features", updated);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newFeature.trim()) {
                    update("features", [...form.features, newFeature.trim()]);
                    setNewFeature("");
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (newFeature.trim()) {
                  update("features", [...form.features, newFeature.trim()]);
                  setNewFeature("");
                }
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
