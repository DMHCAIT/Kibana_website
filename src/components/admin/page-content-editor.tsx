"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

// ── Shared primitives ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{children}</label>;
}

export function Field({ label, value, onChange, placeholder, hint, disabled }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; hint?: string; disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
      />
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, hint, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; rows?: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 resize-none transition-colors"
      />
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function SaveBar({ onSave, saving, msg }: {
  onSave: () => void; saving: boolean;
  msg: { type: "ok" | "err"; text: string } | null;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
      {msg ? (
        <div className={`flex items-center gap-2 text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
          {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {msg.text}
        </div>
      ) : <div />}
      <button
        onClick={onSave}
        disabled={saving}
        className="px-5 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

// ── About Page Editor ───────────────────────────────────────────────────────

type AboutData = {
  title: string;
  subtitle: string;
  content: string;
  heroImage: string;
  stats: { number: string; label: string }[];
};

export function AboutEditor({ initialData }: { initialData: AboutData }) {
  const [data, setData] = useState<AboutData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const set = (key: keyof AboutData, val: unknown) => setData((d) => ({ ...d, [key]: val }));

  const setStat = (i: number, key: "number" | "label", val: string) =>
    setData((d) => {
      const next = [...d.stats];
      next[i] = { ...next[i], [key]: val };
      return { ...d, stats: next };
    });

  const addStat = () => set("stats", [...data.stats, { number: "", label: "" }]);
  const removeStat = (i: number) => set("stats", data.stats.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-config", { method: "GET" });
      const config = await res.json();
      config.pages = { ...config.pages, about: data };
      const put = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMsg(put.ok ? { type: "ok", text: "About page saved! Refresh /about to see changes." } : { type: "err", text: "Error saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">About Us Page</h1>
        <p className="text-xs text-gray-400 mt-0.5">Edit the content shown on the /about page</p>
      </div>
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Hero Content</h3>
            <Field label="Page Title" value={data.title} onChange={(v) => set("title", v)} />
            <Field label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} />
            <TextArea label="Main Content / Story" value={data.content} onChange={(v) => set("content", v)} rows={5} hint="This is the main brand story text." />
            <Field label="Hero Image URL" value={data.heroImage} onChange={(v) => set("heroImage", v)} placeholder="/extracted/img-010.jpg" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {data.heroImage && <img src={data.heroImage} alt="" className="h-32 w-auto rounded-xl border object-cover" />}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Stats / Numbers</h3>
              <button onClick={addStat} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Stat
              </button>
            </div>
            <div className="space-y-3">
              {data.stats.map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Field label="Number/Value" value={s.number} onChange={(v) => setStat(i, "number", v)} placeholder="10K+" />
                    <Field label="Label" value={s.label} onChange={(v) => setStat(i, "label", v)} placeholder="Happy Customers" />
                  </div>
                  <button onClick={() => removeStat(i)} className="mt-5 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Contact Page Editor ──────────────────────────────────────────────────────

type SocialLink = { id: string; platform: string; url: string; label: string };

type ContactData = {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  responseTime: string;
  socialLinks: SocialLink[];
};

const SOCIAL_PLATFORMS = [
  "Instagram", "WhatsApp", "Facebook", "Twitter / X", "YouTube",
  "Pinterest", "LinkedIn", "Snapchat", "TikTok", "Telegram", "Other",
];

const PLATFORM_ICONS: Record<string, string> = {
  "Instagram": "📸",
  "WhatsApp": "💬",
  "Facebook": "👥",
  "Twitter / X": "🐦",
  "YouTube": "▶️",
  "Pinterest": "📌",
  "LinkedIn": "💼",
  "Snapchat": "👻",
  "TikTok": "🎵",
  "Telegram": "✈️",
  "Other": "🔗",
};

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  "Instagram": "https://instagram.com/kibanalife",
  "WhatsApp": "https://wa.me/919711414110",
  "Facebook": "https://facebook.com/kibanalife",
  "Twitter / X": "https://twitter.com/kibanalife",
  "YouTube": "https://youtube.com/@kibanalife",
  "Pinterest": "https://pinterest.com/kibanalife",
  "LinkedIn": "https://linkedin.com/company/kibanalife",
  "Snapchat": "https://snapchat.com/add/kibanalife",
  "TikTok": "https://tiktok.com/@kibanalife",
  "Telegram": "https://t.me/kibanalife",
  "Other": "https://...",
};

export function ContactEditor({ initialData }: { initialData: ContactData }) {
  const [data, setData] = useState<ContactData>({
    ...initialData,
    socialLinks: initialData.socialLinks ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const set = (key: keyof Omit<ContactData, "socialLinks">, val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  // ── Social link helpers ─────────────────────────────────────────────────
  const addLink = () => {
    const id = `sl${Date.now()}`;
    const newLink: SocialLink = { id, platform: "Instagram", url: "", label: "Follow us on Instagram" };
    setData((d) => ({ ...d, socialLinks: [...d.socialLinks, newLink] }));
    setEditingId(id);
  };

  const updateLink = (id: string, patch: Partial<SocialLink>) =>
    setData((d) => ({
      ...d,
      socialLinks: d.socialLinks.map((l) => l.id === id ? { ...l, ...patch } : l),
    }));

  const removeLink = (id: string) => {
    setData((d) => ({ ...d, socialLinks: d.socialLinks.filter((l) => l.id !== id) }));
    if (editingId === id) setEditingId(null);
  };

  // ── Save ────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-config", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch config");
      const config = await res.json();
      config.pages = { ...config.pages, contact: data };
      const put = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMsg(put.ok
        ? { type: "ok", text: "Contact page saved! Refresh /contact to see changes." }
        : { type: "err", text: "Error saving. Please try again." }
      );
    } catch {
      setMsg({ type: "err", text: "Error saving. Check your connection." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">Contact Page</h1>
        <p className="text-xs text-gray-400 mt-0.5">Edit contact info and social media links shown on /contact</p>
      </div>
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-5">

          {/* ── Page Heading ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Page Heading</h3>
            <Field label="Title" value={data.title} onChange={(v) => set("title", v)} placeholder="Get in Touch" />
            <Field label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} placeholder="We'd love to hear from you." />
            <Field
              label="Response Time Message"
              value={data.responseTime}
              onChange={(v) => set("responseTime", v)}
              placeholder="We typically respond within 24 hours."
            />
          </div>

          {/* ── Contact Details ───────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Contact Details</h3>
            <Field label="Email Address" value={data.email} onChange={(v) => set("email", v)} placeholder="hello@kibanalife.com" />
            <Field label="Phone / WhatsApp Number" value={data.phone} onChange={(v) => set("phone", v)} placeholder="+91 00000 00000" />
            <TextArea label="Address" value={data.address} onChange={(v) => set("address", v)} rows={3} placeholder="123 Design District, Mumbai, Maharashtra 400001" />
          </div>

          {/* ── Social Media Links ────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-pink-50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Social Media Links</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add any social profiles — Instagram, WhatsApp, Facebook, YouTube, etc.
                </p>
              </div>
              <button
                onClick={addLink}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Plus className="h-3.5 w-3.5" /> Add Link
              </button>
            </div>

            <div className="p-5 space-y-3">
              {data.socialLinks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm font-medium mb-1">No social links yet</p>
                  <p className="text-xs">Click &quot;Add Link&quot; to add Instagram, WhatsApp, Facebook, etc.</p>
                </div>
              )}

              {data.socialLinks.map((link) => {
                const isEditing = editingId === link.id;
                return (
                  <div
                    key={link.id}
                    className={`border-2 rounded-xl overflow-hidden transition-all ${
                      isEditing ? "border-gray-900" : "border-gray-200"
                    }`}
                  >
                    {/* Row header */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isEditing ? "bg-gray-900" : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => setEditingId(isEditing ? null : link.id)}
                    >
                      <span className="text-lg leading-none">{PLATFORM_ICONS[link.platform] ?? "🔗"}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isEditing ? "text-white" : "text-gray-800"}`}>
                          {link.platform}
                        </p>
                        <p className={`text-[10px] truncate ${isEditing ? "text-white/50" : "text-gray-400"}`}>
                          {link.url || <em className="italic">no URL set</em>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {link.url && (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`p-1.5 rounded-lg transition-colors text-xs ${
                              isEditing ? "text-white/60 hover:text-white hover:bg-white/10" : "text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                            title="Open link"
                          >
                            ↗
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeLink(link.id); }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isEditing ? "text-red-300 hover:text-red-100 hover:bg-red-900/30" : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {isEditing
                          ? <ChevronUp className="h-4 w-4 text-white/60" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                    </div>

                    {/* Expanded edit form */}
                    {isEditing && (
                      <div className="p-4 space-y-3 bg-gray-50 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Platform
                          </label>
                          <select
                            value={link.platform}
                            onChange={(e) => {
                              const p = e.target.value;
                              updateLink(link.id, {
                                platform: p,
                                label: `Follow us on ${p}`,
                              });
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 bg-white transition-colors"
                          >
                            {SOCIAL_PLATFORMS.map((p) => (
                              <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            URL <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(link.id, { url: e.target.value })}
                            placeholder={PLATFORM_PLACEHOLDERS[link.platform] ?? "https://..."}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Label (tooltip / accessibility)
                          </label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateLink(link.id, { label: e.target.value })}
                            placeholder={`Follow us on ${link.platform}`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                          />
                        </div>
                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Done editing
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── FAQs Page Editor ──────────────────────────────────────────────────────────

type FaqItem = { id: string; question: string; answer: string };
type FaqsData = { title: string; subtitle: string; items: FaqItem[] };

export function FaqsEditor({ initialData }: { initialData: FaqsData }) {
  const [data, setData] = useState<FaqsData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const set = (key: keyof FaqsData, val: unknown) => setData((d) => ({ ...d, [key]: val }));

  const updateItem = (id: string, key: keyof FaqItem, val: string) =>
    setData((d) => ({ ...d, items: d.items.map((it) => it.id === id ? { ...it, [key]: val } : it) }));

  const addItem = () => {
    const id = `faq${Date.now()}`;
    setData((d) => ({ ...d, items: [...d.items, { id, question: "", answer: "" }] }));
    setExpanded(id);
  };

  const removeItem = (id: string) => setData((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...data.items];
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    setData((d) => ({ ...d, items: next }));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-config", { method: "GET" });
      const config = await res.json();
      config.pages = { ...config.pages, faqs: data };
      const put = await fetch("/api/admin/site-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      setMsg(put.ok ? { type: "ok", text: "FAQs saved! Refresh /faqs to see changes." } : { type: "err", text: "Error saving." });
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">FAQs Page</h1>
        <p className="text-xs text-gray-400 mt-0.5">Add, edit, reorder, or remove FAQ items</p>
      </div>
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Page Heading</h3>
            <Field label="Title" value={data.title} onChange={(v) => set("title", v)} />
            <Field label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">FAQ Items ({data.items.length})</h3>
              <button onClick={addItem} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add FAQ
              </button>
            </div>

            <div className="space-y-2">
              {data.items.map((item, i) => (
                <div key={item.id} className={`border-2 rounded-xl overflow-hidden transition-all ${expanded === item.id ? "border-gray-900" : "border-gray-200"}`}>
                  <div
                    className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${expanded === item.id ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  >
                    <GripVertical className={`h-4 w-4 flex-shrink-0 ${expanded === item.id ? "text-white/30" : "text-gray-300"}`} />
                    <p className={`flex-1 text-sm font-medium truncate ${expanded === item.id ? "text-white" : "text-gray-800"}`}>
                      {item.question || `Question ${i + 1}`}
                    </p>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => move(i, -1)} disabled={i === 0} className={`p-1 rounded transition-colors disabled:opacity-20 ${expanded === item.id ? "text-white/60 hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"}`}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => move(i, 1)} disabled={i === data.items.length - 1} className={`p-1 rounded transition-colors disabled:opacity-20 ${expanded === item.id ? "text-white/60 hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"}`}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className={`p-1 rounded transition-colors ${expanded === item.id ? "text-red-300 hover:bg-red-900/30" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {expanded === item.id && (
                    <div className="p-4 space-y-3 bg-gray-50 border-t border-gray-200">
                      <Field label="Question" value={item.question} onChange={(v) => updateItem(item.id, "question", v)} placeholder="What is vegan leather?" />
                      <TextArea label="Answer" value={item.answer} onChange={(v) => updateItem(item.id, "answer", v)} rows={4} placeholder="Your answer here..." />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {data.items.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No FAQ items yet. Click "Add FAQ" to create one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Returns Page Editor ──────────────────────────────────────────────────────

type ReturnSection = { id: string; heading: string; content: string };
type ReturnsData = { title: string; subtitle: string; sections: ReturnSection[] };

export function ReturnsEditor({ initialData }: { initialData: ReturnsData }) {
  const [data, setData] = useState<ReturnsData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const set = (key: keyof ReturnsData, val: unknown) => setData((d) => ({ ...d, [key]: val }));

  const updateSection = (id: string, key: keyof ReturnSection, val: string) =>
    setData((d) => ({ ...d, sections: d.sections.map((s) => s.id === id ? { ...s, [key]: val } : s) }));

  const addSection = () => {
    const id = `rs${Date.now()}`;
    setData((d) => ({ ...d, sections: [...d.sections, { id, heading: "", content: "" }] }));
    setExpanded(id);
  };

  const removeSection = (id: string) => setData((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== id) }));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...data.sections];
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    setData((d) => ({ ...d, sections: next }));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-config", { method: "GET" });
      const config = await res.json();
      config.pages = { ...config.pages, returns: data };
      const put = await fetch("/api/admin/site-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      setMsg(put.ok ? { type: "ok", text: "Returns policy saved!" } : { type: "err", text: "Error saving." });
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">Returns Policy Page</h1>
        <p className="text-xs text-gray-400 mt-0.5">Edit the returns & refunds content</p>
      </div>
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Page Heading</h3>
            <Field label="Title" value={data.title} onChange={(v) => set("title", v)} />
            <Field label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Policy Sections ({data.sections.length})</h3>
              <button onClick={addSection} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
            </div>
            <div className="space-y-2">
              {data.sections.map((section, i) => (
                <div key={section.id} className={`border-2 rounded-xl overflow-hidden ${expanded === section.id ? "border-gray-900" : "border-gray-200"}`}>
                  <div
                    className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${expanded === section.id ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
                    onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                  >
                    <p className={`flex-1 text-sm font-medium truncate ${expanded === section.id ? "text-white" : "text-gray-800"}`}>
                      {section.heading || `Section ${i + 1}`}
                    </p>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => move(i, -1)} disabled={i === 0} className={`p-1 rounded disabled:opacity-20 ${expanded === section.id ? "text-white/60 hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"}`}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => move(i, 1)} disabled={i === data.sections.length - 1} className={`p-1 rounded disabled:opacity-20 ${expanded === section.id ? "text-white/60 hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"}`}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeSection(section.id)} className={`p-1 rounded ${expanded === section.id ? "text-red-300 hover:bg-red-900/30" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {expanded === section.id && (
                    <div className="p-4 space-y-3 bg-gray-50 border-t border-gray-200">
                      <Field label="Section Heading" value={section.heading} onChange={(v) => updateSection(section.id, "heading", v)} placeholder="Return Window" />
                      <TextArea label="Content" value={section.content} onChange={(v) => updateSection(section.id, "content", v)} rows={4} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shop Page Editor ──────────────────────────────────────────────────────────

type ShopData = { title: string; subtitle: string; bannerImage: string };

export function ShopPageEditor({ initialData }: { initialData: ShopData }) {
  const [data, setData] = useState<ShopData>(initialData);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const set = (key: keyof ShopData, val: string) => setData((d) => ({ ...d, [key]: val }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-config", { method: "GET" });
      const config = await res.json();
      config.pages = { ...config.pages, shop: data };
      const put = await fetch("/api/admin/site-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      setMsg(put.ok ? { type: "ok", text: "Shop page saved!" } : { type: "err", text: "Error saving." });
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">Shop Page</h1>
        <p className="text-xs text-gray-400 mt-0.5">Edit the header shown on the /shop page</p>
      </div>
      <SaveBar onSave={save} saving={saving} msg={msg} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Shop Header</h3>
            <Field label="Page Title" value={data.title} onChange={(v) => set("title", v)} placeholder="Shop All Bags" />
            <Field label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} placeholder="Discover our complete collection" />
            <Field label="Banner Image URL (optional)" value={data.bannerImage} onChange={(v) => set("bannerImage", v)} placeholder="/extracted/img-010.jpg" hint="Large banner shown at top of shop page" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {data.bannerImage && <img src={data.bannerImage} alt="" className="h-32 w-full rounded-xl border object-cover" />}
          </div>
        </div>
      </div>
    </div>
  );
}
