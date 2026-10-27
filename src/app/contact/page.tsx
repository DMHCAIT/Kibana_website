"use client";

import { useState, useEffect } from "react";
import { MapPin, Mail, Phone, Clock, CheckCircle } from "lucide-react";
import { TrackPageView } from "@/components/analytics/track-page-view";
import { trackViewPage, trackContact } from "@/lib/analytics";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    trackViewPage("Contact Us", "contact");
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Something went wrong.");
      }

      // Track contact form submission via unified tracking with server-side API
      trackContact(form.email, form.phone);

      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="bg-background text-foreground">
      <TrackPageView pageName="Contact Us" pageType="contact" />

      {/* Hero Section */}
      <section className="bg-foreground text-background">
        <div className="storefront-section-space container max-w-[1600px]">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
              Get In Touch
            </p>
            <h1 className="mb-6 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              We'd Love to
              <br />
              Hear From You
            </h1>
            <p className="max-w-lg text-sm text-background/80">
              Whether it's a question about your order, our products, or anything else — our team is
              ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Strip */}
      <section className="border-b border-border/30">
        <div className="container max-w-[1600px]">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {(
              [
                {
                  icon: Phone,
                  label: "Call Us",
                  value: "+91 9711414110",
                  href: "tel:+919711414110",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "support@kibanalife.com",
                  href: "mailto:support@kibanalife.com",
                },
                { icon: Clock, label: "Hours", value: "Mon – Sat, 10 am – 7 pm", href: undefined },
                { icon: MapPin, label: "Location", value: "New Delhi", href: undefined },
              ] as const
            ).map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="flex min-w-0 items-start gap-2 border-r border-border/30 px-2 py-6 last:border-r-0 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6 lg:py-8"
              >
                <Icon className="mt-1 h-5 w-5 flex-shrink-0 text-accent" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="break-words text-sm text-foreground transition-colors hover:text-accent"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-foreground">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="storefront-section-space container max-w-[1600px]">
        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          {/* Left Column - Info */}
          <div>
            <h2 className="mb-8 font-display text-2xl font-semibold">Contact Information</h2>

            <div className="space-y-4">
              {/* Address */}
              <div className="border border-border/30 p-6 transition-colors hover:border-accent/40">
                <div className="mb-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-accent" strokeWidth={1.5} />
                  <p className="text-sm font-semibold uppercase tracking-widest">Address</p>
                </div>
                <p className="text-sm font-light leading-relaxed text-muted-foreground">
                  House No. 1, 2nd Floor, KH.No. 581/2,
                  <br />
                  Village Sultanpur, New Delhi – 110030
                </p>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border/30 p-6 transition-colors hover:border-accent/40">
                  <div className="mb-4 flex items-center gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0 text-accent" strokeWidth={1.5} />
                    <p className="text-sm font-semibold uppercase tracking-widest">Email</p>
                  </div>
                  <a
                    href="mailto:support@kibanalife.com"
                    className="text-sm text-muted-foreground transition-colors hover:text-accent"
                  >
                    support@kibanalife.com
                  </a>
                </div>
                <div className="border border-border/30 p-6 transition-colors hover:border-accent/40">
                  <div className="mb-4 flex items-center gap-3">
                    <Phone className="h-5 w-5 flex-shrink-0 text-accent" strokeWidth={1.5} />
                    <p className="text-sm font-semibold uppercase tracking-widest">Phone</p>
                  </div>
                  <a
                    href="tel:+919711414110"
                    className="text-sm text-muted-foreground transition-colors hover:text-accent"
                  >
                    +91 9711414110
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="border-l-2 border-accent bg-accent/5 px-6 py-6">
                <div className="mb-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 flex-shrink-0 text-accent" strokeWidth={1.5} />
                  <p className="text-sm font-semibold uppercase tracking-widest">Hours</p>
                </div>
                <p className="text-sm font-medium text-foreground">Monday – Saturday</p>
                <p className="text-sm text-foreground/60">10:00 am – 7:00 pm</p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <h2 className="mb-8 font-display text-2xl font-semibold">Send us a Message</h2>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-accent" />
                <h3 className="mb-2 font-display text-lg font-semibold">Message Sent!</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm font-semibold uppercase tracking-wide text-accent transition-colors hover:text-accent/80"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Name <span className="text-accent">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full border border-border/30 bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Email <span className="text-accent">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full border border-border/30 bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 000 000 0000"
                      className="w-full border border-border/30 bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full resize-none border border-border/30 bg-background px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-widest text-background transition-all hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
