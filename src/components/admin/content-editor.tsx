"use client";

import { useState, useRef } from "react";
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import type { SiteConfig } from "@/lib/server-data";

interface Props {
  config: SiteConfig;
}

const TABS = [
  { id: "hero", label: "Hero Banner" },
  { id: "sections", label: "Homepage Sections" },
  { id: "announcement", label: "Announcement Bar" },
  { id: "pages", label: "Pages" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ContentEditor({ config: initialConfig }: Props) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("success", "Content saved! Changes are live on the website.");
    } catch {
      showToast("error", "Failed to save content");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File, path: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "site-media");
    fd.append("path", path);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url!;
  }

  /** Delete a file from Supabase Storage via the upload API (best-effort) */
  async function deleteStorageFile(url: string) {
    if (!url || !url.includes(".supabase.co/storage")) return;
    await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {
      /* non-fatal */
    });
  }

  async function uploadHeroImage(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadImage(file, `hero/image-${Date.now()}.${ext}`);
      setConfig((c) => ({
        ...c,
        hero: { ...c.hero, images: [...(c.hero.images ?? []), url] },
      }));
      showToast("success", "Hero image uploaded");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeHeroImage(i: number) {
    const url = config.hero.images[i];
    // Delete from Supabase Storage (best-effort)
    deleteStorageFile(url);
    setConfig((c) => ({
      ...c,
      hero: { ...c.hero, images: c.hero.images.filter((_, idx) => idx !== i) },
    }));
  }

  function toggleSection(id: string) {
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }));
  }

  function moveSectionUp(index: number) {
    if (index === 0) return;
    const secs = [...config.sections];
    [secs[index - 1], secs[index]] = [secs[index], secs[index - 1]];
    setConfig((c) => ({ ...c, sections: secs }));
  }

  function moveSectionDown(index: number) {
    if (index === config.sections.length - 1) return;
    const secs = [...config.sections];
    [secs[index], secs[index + 1]] = [secs[index + 1], secs[index]];
    setConfig((c) => ({ ...c, sections: secs }));
  }

  return (
    <div className="space-y-5 p-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
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
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Changes auto-reflect on the live website after saving
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex w-fit flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
        {/* Hero Banner */}
        {activeTab === "hero" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Hero Banner</h2>

            <Field label="Headline Title">
              <input
                type="text"
                value={config.hero.title}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, hero: { ...c.hero, title: e.target.value } }))
                }
                className={inputClass}
                placeholder="e.g. Discover Your Style"
              />
            </Field>

            <Field label="Subtitle">
              <input
                type="text"
                value={config.hero.subtitle}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))
                }
                className={inputClass}
                placeholder="e.g. Pure. Minimal. Luxe."
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="CTA Button Label">
                <input
                  type="text"
                  value={config.hero.ctaLabel}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, hero: { ...c.hero, ctaLabel: e.target.value } }))
                  }
                  className={inputClass}
                  placeholder="Shop Now"
                />
              </Field>
              <Field label="CTA Button Link">
                <input
                  type="text"
                  value={config.hero.ctaHref}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, hero: { ...c.hero, ctaHref: e.target.value } }))
                  }
                  className={inputClass}
                  placeholder="/shop"
                />
              </Field>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Hero Slideshow Images
              </label>

              {/* Existing images */}
              {(config.hero.images ?? []).length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-3">
                  {(config.hero.images ?? []).map((url, i) => (
                    <div key={i} className="group relative">
                      <ResponsiveImage
                        src={url}
                        alt={`Hero ${i + 1}`}
                        width={400}
                        height={112}
                        className="rounded-xl border border-gray-200"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => removeHeroImage(i)}
                          className="rounded-full bg-red-500 p-1 text-white shadow"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <span className="absolute left-1 top-1 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-white">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload */}
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
              >
                {uploading ? (
                  <Loader2 size={20} className="mx-auto mb-1 animate-spin text-gray-400" />
                ) : (
                  <Upload size={20} className="mx-auto mb-1 text-gray-400" />
                )}
                <p className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Upload hero image"}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadHeroImage(f);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="hidden"
              />

              {/* URL input */}
              <div className="mt-3">
                <input
                  type="url"
                  placeholder="Or paste image URL and press Enter"
                  className={inputClass}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        setConfig((c) => ({
                          ...c,
                          hero: { ...c.hero, images: [...(c.hero.images ?? []), val] },
                        }));
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Homepage Sections */}
        {activeTab === "sections" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Homepage Sections</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Toggle visibility and reorder homepage sections
              </p>
            </div>

            {config.sections.length === 0 && (
              <div className="py-8 text-center text-gray-400">
                <p>No sections configured.</p>
                <p className="mt-1 text-xs">Sections will appear after initial setup.</p>
              </div>
            )}

            <div className="space-y-2">
              {config.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
                      section.visible
                        ? "border-gray-200 bg-white"
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <GripVertical size={18} className="shrink-0 text-gray-300" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{section.label}</p>
                      <p className="text-xs text-gray-400">{section.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronDown size={16} className="rotate-180" />
                      </button>
                      <button
                        onClick={() => moveSectionDown(index)}
                        disabled={index === config.sections.length - 1}
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                          section.visible
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        {section.visible ? "Visible" : "Hidden"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Announcement Bar */}
        {activeTab === "announcement" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Announcement Bar</h2>
            <p className="text-sm text-gray-500">
              Displayed at the top of every page. Leave empty to hide.
            </p>
            <Field label="Announcement Text">
              <input
                type="text"
                value={config.announcementBar ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, announcementBar: e.target.value }))}
                placeholder="e.g. Free shipping on orders over ₹999! Use code FREESHIP"
                className={inputClass}
              />
            </Field>
            {config.announcementBar && (
              <div className="rounded-xl bg-gray-900 px-4 py-2.5 text-center text-sm text-white">
                Preview: {config.announcementBar}
              </div>
            )}
          </div>
        )}

        {/* Pages */}
        {activeTab === "pages" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Page Content</h2>

            {/* About */}
            <CollapsibleSection title="About Us Page">
              <div className="space-y-3">
                <Field label="Title">
                  <input
                    type="text"
                    value={config.pages.about.title}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: { ...c.pages, about: { ...c.pages.about, title: e.target.value } },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    type="text"
                    value={config.pages.about.subtitle}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: {
                          ...c.pages,
                          about: { ...c.pages.about, subtitle: e.target.value },
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Content">
                  <textarea
                    rows={4}
                    value={config.pages.about.content}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: { ...c.pages, about: { ...c.pages.about, content: e.target.value } },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Hero Image URL">
                  <input
                    type="url"
                    value={config.pages.about.heroImage}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: {
                          ...c.pages,
                          about: { ...c.pages.about, heroImage: e.target.value },
                        },
                      }))
                    }
                    className={inputClass}
                    placeholder="https://..."
                  />
                </Field>
              </div>
            </CollapsibleSection>

            {/* Contact */}
            <CollapsibleSection title="Contact Page">
              <div className="space-y-3">
                <Field label="Title">
                  <input
                    type="text"
                    value={config.pages.contact.title}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: {
                          ...c.pages,
                          contact: { ...c.pages.contact, title: e.target.value },
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={config.pages.contact.email}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: {
                          ...c.pages,
                          contact: { ...c.pages.contact, email: e.target.value },
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="text"
                    value={config.pages.contact.phone}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: {
                          ...c.pages,
                          contact: { ...c.pages.contact, phone: e.target.value },
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Address">
                  <textarea
                    rows={2}
                    value={config.pages.contact.address}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: {
                          ...c.pages,
                          contact: { ...c.pages.contact, address: e.target.value },
                        },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </CollapsibleSection>

            {/* FAQs */}
            <CollapsibleSection title="FAQs Page">
              <div className="space-y-3">
                <Field label="Title">
                  <input
                    type="text"
                    value={config.pages.faqs.title}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        pages: { ...c.pages, faqs: { ...c.pages.faqs, title: e.target.value } },
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">FAQ Items</label>
                    <button
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          pages: {
                            ...c.pages,
                            faqs: {
                              ...c.pages.faqs,
                              items: [
                                ...c.pages.faqs.items,
                                { id: Date.now().toString(), question: "", answer: "" },
                              ],
                            },
                          },
                        }))
                      }
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Plus size={13} /> Add FAQ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {config.pages.faqs.items.map((faq, i) => (
                      <div
                        key={faq.id}
                        className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const items = [...config.pages.faqs.items];
                                items[i] = { ...items[i], question: e.target.value };
                                setConfig((c) => ({
                                  ...c,
                                  pages: { ...c.pages, faqs: { ...c.pages.faqs, items } },
                                }));
                              }}
                              placeholder="Question"
                              className={`${inputClass} text-sm`}
                            />
                            <textarea
                              rows={2}
                              value={faq.answer}
                              onChange={(e) => {
                                const items = [...config.pages.faqs.items];
                                items[i] = { ...items[i], answer: e.target.value };
                                setConfig((c) => ({
                                  ...c,
                                  pages: { ...c.pages, faqs: { ...c.pages.faqs, items } },
                                }));
                              }}
                              placeholder="Answer"
                              className={`${inputClass} text-sm`}
                            />
                          </div>
                          <button
                            onClick={() =>
                              setConfig((c) => ({
                                ...c,
                                pages: {
                                  ...c.pages,
                                  faqs: {
                                    ...c.pages.faqs,
                                    items: c.pages.faqs.items.filter((_, idx) => idx !== i),
                                  },
                                },
                              }))
                            }
                            className="mt-0.5 p-1.5 text-red-400 transition-colors hover:text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>

      {/* Save button bottom */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}

// Helpers

const inputClass =
  "w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {open ? (
          <ChevronDown size={18} className="text-gray-400" />
        ) : (
          <ChevronRight size={18} className="text-gray-400" />
        )}
      </button>
      {open && <div className="space-y-3 px-5 pb-5">{children}</div>}
    </div>
  );
}
