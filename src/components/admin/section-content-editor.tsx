"use client";

import { useState } from "react";
import { MediaUpload } from "./media-upload";
import { Field, SaveBar } from "./page-content-editor";

// ── Types ─────────────────────────────────────────────────────────────────────

type BestSellersContent = {
  leftImage: string;
  rightImage: string;
  heading: string;
  buttonText: string;
  productSlug: string;
};

type CraftsmanshipContent = {
  image: string;
  text: string;
};

type HeroContent = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  images: string[];
};

// ── Shared save helper ────────────────────────────────────────────────────────

async function patchSiteConfig(patch: Record<string, unknown>) {
  const res = await fetch("/api/admin/site-config", { method: "GET" });
  if (!res.ok) throw new Error("Failed to load config");
  const config = await res.json();

  // Deep merge patch into config
  for (const [key, val] of Object.entries(patch)) {
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      config[key] = { ...(config[key] ?? {}), ...(val as object) };
    } else {
      config[key] = val;
    }
  }

  const put = await fetch("/api/admin/site-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!put.ok) throw new Error("Failed to save config");
}

// ── Hero Banner Editor ────────────────────────────────────────────────────────

export function HeroEditor({ initialData }: { initialData: HeroContent }) {
  const [data, setData] = useState<HeroContent>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const set = (key: keyof HeroContent, val: unknown) =>
    setData((d) => ({ ...d, [key]: val }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await patchSiteConfig({ hero: data });
      setMsg({ type: "ok", text: "Hero banner saved!" });
    } catch {
      setMsg({ type: "err", text: "Failed to save. Try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Headline"
            value={data.title}
            onChange={(v) => set("title", v)}
            placeholder="e.g. Crafted for the Ones Who Move the World"
          />
          <Field
            label="Sub-headline"
            value={data.subtitle}
            onChange={(v) => set("subtitle", v)}
            placeholder="e.g. Premium Vegan Leather Bags"
          />
          <Field
            label="CTA Button Label"
            value={data.ctaLabel}
            onChange={(v) => set("ctaLabel", v)}
            placeholder="e.g. Shop Now"
          />
          <Field
            label="CTA Button Link"
            value={data.ctaHref}
            onChange={(v) => set("ctaHref", v)}
            placeholder="e.g. /shop"
          />
        </div>

        {/* Hero images */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Slideshow Images ({data.images.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.images.map((img, i) => (
              <div key={i} className="space-y-2">
                <MediaUpload
                  label={`Image ${i + 1}`}
                  value={img}
                  onChange={(url) => {
                    const next = [...data.images];
                    next[i] = url;
                    set("images", next);
                  }}
                  bucket="site-assets"
                  storagePath={`hero/slide-${i + 1}-{ts}`}
                  type="image"
                />
                <button
                  onClick={() => set("images", data.images.filter((_, idx) => idx !== i))}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove slide
                </button>
              </div>
            ))}
            <button
              onClick={() => set("images", [...data.images, ""])}
              className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              + Add slide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Best Sellers Editor ───────────────────────────────────────────────────────

export function BestSellersEditor({ initialData }: { initialData: BestSellersContent }) {
  const [data, setData] = useState<BestSellersContent>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const set = (key: keyof BestSellersContent, val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await patchSiteConfig({ sectionContent: { bestSellers: data } });
      setMsg({ type: "ok", text: "Best Sellers section saved!" });
    } catch {
      setMsg({ type: "err", text: "Failed to save. Try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="p-6 space-y-6">
        {/* Preview hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
          This section displays a full-width split banner. Left + right images sit side by side with the heading and button overlaid in the center.
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MediaUpload
            label="Left Image"
            value={data.leftImage}
            onChange={(url) => set("leftImage", url)}
            bucket="site-assets"
            storagePath="best-sellers/left-{ts}"
            type="image"
            hint="Shows on the left half of the banner"
          />
          <MediaUpload
            label="Right Image"
            value={data.rightImage}
            onChange={(url) => set("rightImage", url)}
            bucket="site-assets"
            storagePath="best-sellers/right-{ts}"
            type="image"
            hint="Shows on the right half of the banner"
          />
        </div>

        {/* Text + link */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field
            label="Heading Text"
            value={data.heading}
            onChange={(v) => set("heading", v)}
            placeholder="e.g. GOT YOUR BACK"
            hint="Words separated by spaces are placed on separate lines"
          />
          <Field
            label="Button Label"
            value={data.buttonText}
            onChange={(v) => set("buttonText", v)}
            placeholder="e.g. SHOP NOW"
          />
          <Field
            label="Product Slug (for button link)"
            value={data.productSlug}
            onChange={(v) => set("productSlug", v)}
            placeholder="e.g. north-backpack"
            hint="The URL slug of the product this button links to"
          />
        </div>
      </div>
    </div>
  );
}

// ── Craftsmanship Editor ──────────────────────────────────────────────────────

export function CraftsmanshipEditor({ initialData }: { initialData: CraftsmanshipContent }) {
  const [data, setData] = useState<CraftsmanshipContent>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const set = (key: keyof CraftsmanshipContent, val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await patchSiteConfig({ sectionContent: { craftsmanship: data } });
      setMsg({ type: "ok", text: "Craftsmanship section saved!" });
    } catch {
      setMsg({ type: "err", text: "Failed to save. Try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="p-6 space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
          Full-width banner image with an italic overlay text centered on it.
        </div>

        <MediaUpload
          label="Banner Image"
          value={data.image}
          onChange={(url) => set("image", url)}
          bucket="site-assets"
          storagePath="craftsmanship/banner-{ts}"
          type="image"
          hint="Wide landscape image — recommended 16:7 ratio"
        />

        <Field
          label="Overlay Text"
          value={data.text}
          onChange={(v) => set("text", v)}
          placeholder="e.g. Craftsmanship"
          hint="Displayed in italic Playfair Display font over the image"
        />
      </div>
    </div>
  );
}
