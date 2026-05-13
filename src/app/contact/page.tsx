import type { Metadata } from "next";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — Kibana",
  description:
    "Get in touch with the Kibana team. Reach us by email, phone, or fill out the contact form and we'll get back to you.",
};

export default function ContactPage() {
  return (
    <main className="bg-kibana-cream text-kibana-ink">

      {/* ── Hero ── */}
      <section className="bg-kibana-ink">
        <div className="container py-12 md:py-20">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-kibana-tan" />
            <p className="text-[9px] font-bold uppercase tracking-[0.45em] text-kibana-tan">Get In Touch</p>
          </div>
          <h1 className="font-bold uppercase tracking-[0.1em] text-3xl sm:text-4xl md:text-5xl text-kibana-cream leading-tight max-w-lg">
            We&apos;d Love to<br />
            <span className="text-kibana-tan">Hear From You</span>
          </h1>
          <p className="text-kibana-cream/80 text-sm mt-5 max-w-md leading-relaxed">
            Whether it&apos;s a question about your order, our products, or anything else — our team is ready to help.
          </p>
        </div>
      </section>

      {/* ── Quick contact strip ── */}
      <section className="border-b border-kibana-ink/8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-kibana-ink/8">
            {([
              { icon: Phone, label: "Call Us", value: "+91 9711414110", href: "tel:+919711414110" },
              { icon: Mail, label: "Email Us", value: "support@kibanalife.com", href: "mailto:support@kibanalife.com" },
              { icon: Clock, label: "Working Hours", value: "Mon – Sat, 10 am – 7 pm", href: undefined },
              { icon: MapPin, label: "Visit Us", value: "Sultanpur, New Delhi – 110030", href: undefined },
            ] as const).map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="px-4 sm:px-6 py-5 flex items-start gap-3 bg-kibana-stone">
                <div className="w-8 h-8 bg-kibana-ink flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-kibana-tan" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-kibana-ink/40 mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-xs text-kibana-ink/80 hover:text-kibana-camel transition-colors leading-snug break-all">
                      {value}
                    </a>
                  ) : (
                    <p className="text-xs text-kibana-ink/80 leading-snug">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="container py-14 md:py-20">
        <div className="grid md:grid-cols-[1fr_1.15fr] gap-10 md:gap-16 items-start max-w-5xl">

          {/* ── Left: Info cards ── */}
          <div>
            <div className="flex items-center gap-3 mb-7">
              <span className="h-px w-6 bg-kibana-tan" />
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-kibana-tan">Our Details</p>
            </div>

            <div className="space-y-3">
              {/* Address */}
              <div className="border border-kibana-ink/10 bg-white p-5 group hover:border-kibana-tan/40 transition-colors">
                <div className="flex items-center gap-2 mb-2.5">
                  <MapPin className="h-3.5 w-3.5 text-kibana-tan shrink-0" />
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40">Address</p>
                </div>
                <p className="text-sm text-kibana-ink/80 leading-relaxed">
                  House No. 1, 2nd Floor, KH.No. 581/2,<br />
                  Village Sultanpur, New Delhi – 110030
                </p>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-kibana-ink/10 bg-white p-5 hover:border-kibana-tan/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Mail className="h-3.5 w-3.5 text-kibana-tan shrink-0" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40">E-mail</p>
                  </div>
                  <a href="mailto:support@kibanalife.com" className="text-xs text-kibana-ink/80 hover:text-kibana-camel transition-colors break-all leading-relaxed">
                    support@kibanalife.com
                  </a>
                </div>
                <div className="border border-kibana-ink/10 bg-white p-5 hover:border-kibana-tan/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Phone className="h-3.5 w-3.5 text-kibana-tan shrink-0" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40">Phone</p>
                  </div>
                  <a href="tel:+919711414110" className="text-xs text-kibana-ink/80 hover:text-kibana-camel transition-colors">
                    +91 9711414110
                  </a>
                </div>
              </div>

              {/* Working hours */}
              <div className="border-l-2 border-kibana-tan bg-kibana-tan/5 px-5 py-4 flex items-start gap-4">
                <Clock className="h-4 w-4 text-kibana-tan mt-0.5 shrink-0" />
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40 mb-1.5">Working Hours</p>
                  <p className="text-sm font-semibold text-kibana-ink">Monday – Saturday</p>
                  <p className="text-sm text-kibana-ink/60">10:00 am – 7:00 pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Form (light card) ── */}
          <div className="bg-white border border-kibana-ink/8 px-7 py-8 sm:px-10 sm:py-10 shadow-sm">
            <div className="flex items-center gap-3 mb-7">
              <span className="h-px w-6 bg-kibana-tan" />
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-kibana-tan">Send a Message</p>
            </div>

            <form className="space-y-5" action="mailto:support@kibanalife.com" method="get">
              <div>
                <label htmlFor="name" className="block text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40 mb-2">
                  Name <span className="text-kibana-tan">*</span>
                </label>
                <input
                  id="name" name="name" type="text" required
                  placeholder="Your full name"
                  className="w-full bg-kibana-stone border border-kibana-ink/10 px-4 py-3 text-sm text-kibana-ink placeholder:text-kibana-ink/30 focus:outline-none focus:border-kibana-tan transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40 mb-2">
                    E-mail <span className="text-kibana-tan">*</span>
                  </label>
                  <input
                    id="email" name="email" type="email" required
                    placeholder="you@example.com"
                    className="w-full bg-kibana-stone border border-kibana-ink/10 px-4 py-3 text-sm text-kibana-ink placeholder:text-kibana-ink/30 focus:outline-none focus:border-kibana-tan transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40 mb-2">
                    Phone No.
                  </label>
                  <input
                    id="phone" name="phone" type="tel"
                    placeholder="+91 00000 00000"
                    className="w-full bg-kibana-stone border border-kibana-ink/10 px-4 py-3 text-sm text-kibana-ink placeholder:text-kibana-ink/30 focus:outline-none focus:border-kibana-tan transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-[8px] font-bold uppercase tracking-[0.3em] text-kibana-ink/40 mb-2">
                  Message
                </label>
                <textarea
                  id="message" name="message" rows={5}
                  placeholder="How can we help you?"
                  className="w-full bg-kibana-stone border border-kibana-ink/10 px-4 py-3 text-sm text-kibana-ink placeholder:text-kibana-ink/30 focus:outline-none focus:border-kibana-tan transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-kibana-ink text-kibana-cream text-[10px] font-bold uppercase tracking-[0.3em] py-4 hover:bg-kibana-tan hover:text-kibana-ink transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>

    </main>
  );
}
