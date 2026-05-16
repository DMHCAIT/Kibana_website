"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { Plus, Trash2, ChevronDown, ChevronRight, AlertCircle, CheckCircle2, ImageIcon, Tag, DollarSign, Layers, Star, Palette, Video, Film, Info } from "lucide-react";
import { MediaUpload, GalleryUpload } from "@/components/admin/media-upload";

type ColorVariant = {
  color: string;
  hex: string;
  slug: string;
  image: string;
  gallery: string[];
  price?: number;
  compareAtPrice?: number;
  inStock: boolean;
  description?: string;
  features?: string[];
  specs?: Record<string, string>;
};

type FormProduct = Omit<Product, "colorVariants"> & { order?: number; video?: string; colorVariants: ColorVariant[] };
type Props = { product: FormProduct; isNew?: boolean };

const CATEGORIES = ["tote-bag", "laptop-bag", "sling-bag", "clutch", "backpack", "wallet", "handbag"];
const GENDERS = ["women", "men", "unisex"];

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{className?:string}>; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, disabled, hint, required }: {
  label?: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; hint?: string; required?: boolean;
}) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
      />
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, placeholder, hint }: {
  label?: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 resize-none transition-colors"
      />
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Select({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 bg-white transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, description, value, onChange }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all w-full ${
        value ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        value ? "border-white bg-white" : "border-gray-300"
      }`}>
        {value && <div className="w-2 h-2 rounded-full bg-gray-900" />}
      </div>
      <div>
        <p className="text-xs font-semibold">{label}</p>
        {description && <p className={`text-[10px] mt-0.5 ${value ? "text-white/70" : "text-gray-400"}`}>{description}</p>}
      </div>
    </button>
  );
}

function ColorVariantCard({ variant, index, onChange, onRemove }: {
  variant: ColorVariant; index: number;
  onChange: (v: ColorVariant) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const set = (key: keyof ColorVariant, val: unknown) => onChange({ ...variant, [key]: val });

  const specsText = Object.entries(variant.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n");
  const parseSpecs = (raw: string): Record<string, string> => {
    const out: Record<string, string> = {};
    raw.split("\n").forEach((line) => {
      const [k, ...rest] = line.split(":");
      if (k?.trim()) out[k.trim()] = rest.join(":").trim();
    });
    return out;
  };

  return (
    <div className={`border-2 rounded-xl overflow-hidden transition-all ${open ? "border-gray-900" : "border-gray-200"}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${open ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
        onClick={() => setOpen(!open)}
      >
        <div className="w-6 h-6 rounded-full border-2 border-white/30 flex-shrink-0" style={{ background: variant.hex || "#ccc" }} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${open ? "text-white" : "text-gray-800"}`}>
            {variant.color || `Color ${index + 1}`}
          </p>
          <p className={`text-[10px] font-mono ${open ? "text-white/50" : "text-gray-400"}`}>
            {variant.hex} · /{variant.slug || "slug"}
            {variant.price ? ` · Rs.${variant.price}` : ""}
            {!variant.inStock ? " · Out of Stock" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className={`p-1.5 rounded-lg transition-colors ${open ? "text-red-300 hover:text-red-100 hover:bg-red-900/30" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {open ? <ChevronDown className="h-4 w-4 text-white/60" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="p-5 space-y-4 bg-gray-50 border-t border-gray-200">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Color Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Color Name" value={variant.color} onChange={(v) => set("color", v)} placeholder="e.g. Midnight Black" />
              <div>
                <Label>Hex Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={variant.hex || "#000000"} onChange={(e) => set("hex", e.target.value)} className="h-[42px] w-12 p-0.5 border border-gray-200 rounded-lg cursor-pointer" />
                  <input type="text" value={variant.hex} onChange={(e) => set("hex", e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20" placeholder="#000000" />
                </div>
              </div>
            </div>
            <Input label="URL Slug" value={variant.slug} onChange={(v) => set("slug", v)} placeholder="e.g. midnight-black" hint="Used in URL for this color" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Pricing & Stock</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price Override (Rs.)" type="number" value={String(variant.price ?? "")} onChange={(v) => set("price", v ? Number(v) : undefined)} placeholder="Leave empty to use base price" />
              <Input label="MRP Override (Rs.)" type="number" value={String(variant.compareAtPrice ?? "")} onChange={(v) => set("compareAtPrice", v ? Number(v) : undefined)} placeholder="Leave empty to use base MRP" />
            </div>
            <div>
              <Label>Stock Status</Label>
              <div className="flex gap-2">
                <button type="button" onClick={() => set("inStock", true)} className={`flex-1 py-2.5 text-xs rounded-lg border font-medium transition-colors ${variant.inStock ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>In Stock</button>
                <button type="button" onClick={() => set("inStock", false)} className={`flex-1 py-2.5 text-xs rounded-lg border font-medium transition-colors ${!variant.inStock ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>Out of Stock</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Images for This Color</p>
            <MediaUpload
              label="Main Image"
              value={variant.image}
              onChange={(v) => set("image", v)}
              bucket="product-images"
              storagePath={`${variant.slug || `variant-${index}`}/main`}
              type="image"
              hint="Primary image shown when this color is selected"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {variant.image && <img src={variant.image} alt="" className="h-28 w-auto rounded-xl border object-cover" />}
            <GalleryUpload
              label="Gallery Images"
              value={variant.gallery ?? []}
              onChange={(v) => set("gallery", v)}
              bucket="product-images"
              basePath={variant.slug || `variant-${index}`}
              hint="These images appear as thumbnails when this color is selected"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Product Page Content for This Color</p>
            <p className="text-[10px] text-gray-400">Leave blank to use the product-level defaults. These override product-level fields when this color is selected.</p>
            <Textarea
              label="Description Override"
              value={variant.description ?? ""}
              onChange={(v) => set("description", v || undefined)}
              rows={3}
              placeholder="Unique product description for this color variant..."
            />
            <Textarea
              label="Features Override (one bullet per line)"
              value={(variant.features ?? []).join("\n")}
              onChange={(v) => set("features", v ? v.split("\n").filter(Boolean) : undefined)}
              rows={4}
              placeholder={"Premium vegan leather in deep black\nGold-tone hardware\nSoft microfiber lining"}
              hint="Each line becomes a bullet point. Overrides product-level features for this color."
            />
            <Textarea
              label="Specs Override (Key: Value, one per line)"
              value={specsText}
              onChange={(v) => set("specs", Object.keys(parseSpecs(v)).length ? parseSpecs(v) : undefined)}
              rows={4}
              placeholder={"Material: Vegan Leather (Onyx Black)\nDimensions: 40 x 30 x 12 cm\nWeight: 680g"}
              hint="Overrides the product-level specs table for this color."
            />
            {Object.keys(variant.specs ?? {}).length > 0 && (
              <div className="overflow-hidden border border-gray-100 rounded-lg mt-2">
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(variant.specs ?? {}).map(([k, v]) => (
                      <tr key={k} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 px-3 font-medium text-gray-600 bg-gray-50 w-40">{k}</td>
                        <td className="py-2 px-3 text-gray-800">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductEditForm({ product, isNew = false }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormProduct>({
    ...product,
    gallery: product.gallery ?? [],
    colors: product.colors ?? [],
    features: product.features ?? [],
    specs: product.specs ?? {},
    video: (product as FormProduct).video ?? "",
    colorVariants: (product.colorVariants ?? []).map((v: ColorVariant) => ({
      color: v.color ?? "",
      hex: v.hex ?? "#000000",
      slug: v.slug ?? "",
      image: v.image ?? "",
      gallery: v.gallery ?? [],
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      inStock: v.inStock !== false,
      description: v.description ?? "",
      features: v.features ?? [],
      specs: v.specs ?? {},
    })),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const set = (field: string, val: unknown) => setForm((f) => ({ ...f, [field]: val }));

  const addColorVariant = () => {
    setForm((f) => ({
      ...f,
      colorVariants: [...f.colorVariants, { color: "", hex: "#000000", slug: "", image: "", gallery: [], inStock: true, description: "", features: [], specs: {} }],
    }));
    setTimeout(() => document.getElementById("color-variants-section")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const updateVariant = (i: number, v: ColorVariant) => {
    setForm((f) => { const next = [...f.colorVariants]; next[i] = v; return { ...f, colorVariants: next }; });
  };

  const removeVariant = (i: number) => {
    setForm((f) => ({ ...f, colorVariants: f.colorVariants.filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    if (!form.image && !form.video) {
      setMsg({ type: "err", text: "Please provide at least one image or video before saving." });
      setSaving(false);
      return;
    }
    try {
      const res = isNew
        ? await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch(`/api/admin/products/${form.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        setMsg({ type: "ok", text: "Saved successfully! The storefront will reflect changes immediately." });
        router.refresh();
        if (isNew) router.push("/admin/products");
      } else {
        setMsg({ type: "err", text: "Error saving product. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm(`Delete "${form.name}"? This action cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
    router.push("/admin/products");
  };

  const specsText = Object.entries(form.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n");
  const parseSpecs = (raw: string): Record<string, string> => {
    const out: Record<string, string> = {};
    raw.split("\n").forEach((line) => {
      const [k, ...rest] = line.split(":");
      if (k?.trim()) out[k.trim()] = rest.join(":").trim();
    });
    return out;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0 sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{isNew ? "Add New Product" : form.name || "Edit Product"}</h1>
          {!isNew && <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {form.id} · /shop/{form.slug}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          {!isNew && (
            <button onClick={del} disabled={deleting} className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <button onClick={save} disabled={saving} className="px-5 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium">
            {saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 mx-6 mt-4 px-4 py-3 rounded-xl text-sm flex-shrink-0 border ${msg.type === "ok" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Tag} title="Basic Information" subtitle="Product name, ID, URL and description" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product ID" value={form.id} onChange={(v) => set("id", v)} disabled={!isNew} hint={isNew ? "Unique identifier (no spaces)" : "Cannot change after creation"} required />
              <Input label="URL Slug" value={form.slug} onChange={(v) => set("slug", v)} hint="/shop/{slug}" required />
            </div>
            <Input label="Product Name" value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Vistara Tote Bag" required />
            <Textarea label="Product Description" value={form.description} onChange={(v) => set("description", v)} rows={4} placeholder="Describe the product in detail — material, style, occasion, etc." />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader icon={DollarSign} title="Pricing" subtitle="Selling price and original MRP" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Selling Price (Rs.)" type="number" value={String(form.price)} onChange={(v) => set("price", Number(v))} required />
              <Input label="MRP / Compare-at Price (Rs.)" type="number" value={String(form.compareAtPrice ?? "")} onChange={(v) => set("compareAtPrice", v ? Number(v) : undefined)} hint="Shown as strikethrough (original price)" />
            </div>
            {form.compareAtPrice && form.compareAtPrice > form.price && (
              <div className="text-xs text-green-700 bg-green-50 px-3 py-2.5 rounded-lg border border-green-200 font-medium">
                Discount: {Math.round(((form.compareAtPrice - form.price) / form.compareAtPrice) * 100)}% off — customers see Rs.{(form.compareAtPrice - form.price).toLocaleString("en-IN")} savings
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Layers} title="Classification & Tags" subtitle="Category, gender and homepage section tags" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" value={form.category} options={CATEGORIES} onChange={(v) => set("category", v)} />
              <Select label="Gender" value={(form as FormProduct).gender ?? "women"} options={GENDERS} onChange={(v) => set("gender", v)} />
            </div>
            <div>
              <Label>Homepage Section Tags</Label>
              <p className="text-[10px] text-gray-400 mb-2">Controls which homepage sections this product appears in (if not manually overridden in Section Products)</p>
              <div className="grid grid-cols-3 gap-2">
                <Toggle label="New Arrival" description="New Arrivals section" value={!!form.isNew} onChange={(v) => set("isNew", v)} />
                <Toggle label="Best Seller" description="Best Sellers section" value={!!form.isBestSeller} onChange={(v) => set("isBestSeller", v)} />
                <Toggle label="Trending" description="Viral / Most Trending" value={!!form.isTrending} onChange={(v) => set("isTrending", v)} />
              </div>
            </div>
          </div>

          {/* ── Media & Style in Motion ─────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Film className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">Media — Style in Motion</h3>
                <p className="text-xs text-white/70 mt-0.5">Upload an image, a video, or both. At least one is required. These appear in the <strong className="text-white">Style in Motion</strong> carousel on the homepage.</p>
              </div>
              <span className="flex-shrink-0 bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/30">
                {form.image && form.video ? "Image + Video ✓" : form.image ? "Image ✓" : form.video ? "Video ✓" : "⚠ Required"}
              </span>
            </div>

            <div className="p-5 space-y-5">
              {!form.image && !form.video && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">Provide at least one image or video. Both can be added for a richer carousel experience — the video plays inline on the homepage.</p>
                </div>
              )}

              {/* Two-column media panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image panel */}
                <div className={`rounded-xl border-2 p-4 space-y-3 transition-colors ${
                  form.image ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-gray-50/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Image</p>
                        <p className="text-[10px] text-gray-400">JPEG, PNG, WEBP</p>
                      </div>
                    </div>
                    {form.image && (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Added ✓</span>
                    )}
                  </div>
                  <MediaUpload
                    label="Main / Hero Image"
                    value={form.image}
                    onChange={(v) => set("image", v)}
                    bucket="product-images"
                    storagePath={`${form.id}/main`}
                    type="image"
                    placeholder="https://... or upload image file"
                  />
                  {form.image && (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="preview" className="w-full h-40 rounded-lg border border-blue-200 object-cover" />
                      <button
                        type="button"
                        onClick={() => set("image", "")}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 p-1 rounded-full shadow border opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Video panel */}
                <div className={`rounded-xl border-2 p-4 space-y-3 transition-colors ${
                  form.video ? "border-purple-200 bg-purple-50/30" : "border-gray-200 bg-gray-50/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Video className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Video</p>
                        <p className="text-[10px] text-gray-400">MP4, WEBM, MOV</p>
                      </div>
                    </div>
                    {form.video && (
                      <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Added ✓</span>
                    )}
                  </div>
                  <MediaUpload
                    label="Product Video"
                    value={form.video ?? ""}
                    onChange={(v) => set("video", v || undefined)}
                    bucket="product-videos"
                    storagePath={`${form.id}/video`}
                    type="video"
                    placeholder="https://... or upload video file"
                  />
                  {form.video && (
                    <div className="relative group">
                      <video
                        src={form.video}
                        controls
                        muted
                        className="w-full h-40 rounded-lg border border-purple-200 object-cover bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => set("video", undefined)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 p-1 rounded-full shadow border opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 leading-relaxed">Plays as an autoplay muted loop in the Style in Motion carousel. Max 200 MB.</p>
                </div>
              </div>

              {/* Homepage usage note */}
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Film className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">Style in Motion carousel:</strong> When this product is assigned to the Style in Motion section, its video (if provided) plays inline in the tile; otherwise the image is shown. You can assign products to homepage sections under <strong className="text-gray-700">Admin → Homepage → Section Products</strong>.
                </p>
              </div>

              {/* Gallery below */}
              <div className="border-t border-gray-100 pt-4">
                <GalleryUpload
                  label="Gallery Images (Product Page)"
                  value={form.gallery}
                  onChange={(v) => set("gallery", v)}
                  bucket="product-images"
                  basePath={form.id}
                  hint="These appear as additional thumbnails in the product image carousel on the product detail page"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Star} title="Features & Specifications" subtitle="Bullet points and specs table shown on the product page" />
            <Textarea
              label="Feature Bullet Points (one per line)"
              value={form.features.join("\n")}
              onChange={(v) => set("features", v.split("\n").filter(Boolean))}
              rows={5}
              placeholder={"Premium vegan leather exterior\nPadded laptop compartment\nAdjustable shoulder strap\nMagnetic snap closure\nInterior zip pocket"}
              hint="Each line becomes a bullet point on the product page"
            />
            <Textarea
              label="Specifications (Key: Value, one per line)"
              value={specsText}
              onChange={(v) => set("specs", parseSpecs(v))}
              rows={5}
              placeholder={"Dimensions: 35 x 28 x 12 cm\nWeight: 650g\nMaterial: Vegan Leather\nClosure: Magnetic Snap"}
              hint="Shown in the specifications table below the product description"
            />
            {Object.keys(form.specs ?? {}).length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="w-full text-xs">
                    <tbody>
                      {Object.entries(form.specs ?? {}).map(([k, v]) => (
                        <tr key={k} className="border-b border-gray-100 last:border-0">
                          <td className="py-2.5 px-3 font-medium text-gray-600 bg-gray-50 w-40">{k}</td>
                          <td className="py-2.5 px-3 text-gray-800">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader icon={Star} title="Display & Rating" subtitle="Sort order and star rating shown on product cards" />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Display Order" type="number" value={String((form as FormProduct).order ?? 99)} onChange={(v) => set("order", Number(v))} hint="Lower number = shown first" />
              <Input label="Rating (0-5)" type="number" value={String(form.rating ?? 4.5)} onChange={(v) => set("rating", Number(v))} />
              <Input label="Review Count" type="number" value={String(form.reviewCount ?? 0)} onChange={(v) => set("reviewCount", Number(v))} />
            </div>
          </div>

          <div id="color-variants-section" className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <SectionHeader
              icon={Palette}
              title={`Color Variants${form.colorVariants.length > 0 ? ` (${form.colorVariants.length})` : ""}`}
              subtitle="Each color gets its own images, pricing, description, features, specs and stock status"
            />

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>How it works:</strong> Add a separate entry for each color option of this product. Each color has its own set of details — treat each color as an independent product with shared branding. Customers switch colors using swatches on the product page.
            </div>

            {form.colorVariants.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Palette className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No color variants yet</p>
                <p className="text-xs text-gray-400 mt-1">Each color you add gets its own images, pricing and product details</p>
                <button onClick={addColorVariant} className="mt-4 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                  Add First Color
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {form.colorVariants.map((v, i) => (
                  <ColorVariantCard key={i} variant={v} index={i} onChange={(updated) => updateVariant(i, updated)} onRemove={() => removeVariant(i)} />
                ))}
              </div>
            )}

            {form.colorVariants.length > 0 && (
              <button
                onClick={addColorVariant}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Another Color
              </button>
            )}
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">All changes are saved to the database immediately upon clicking Save.</p>
            <button onClick={save} disabled={saving} className="px-6 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium">
              {saving ? "Saving..." : isNew ? "Create Product" : "Save All Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
