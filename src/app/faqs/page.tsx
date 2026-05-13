"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type FAQ = { q: string; a: string };
type Category = { id: string; title: string; faqs: FAQ[] };

const categories: Category[] = [
  {
    id: "orders",
    title: "Orders & Cancellations",
    faqs: [
      {
        q: "How can I cancel my order?",
        a: "You can cancel your order within 24 hours of placing it by contacting our support team at support@kibana.in. Once the order has been dispatched, cancellations are not possible.",
      },
      {
        q: "Can I replace or modify my order after placing it?",
        a: "Modifications such as changing the size, colour, or address are possible only within 12 hours of placing the order. Please reach out to us immediately via email or WhatsApp.",
      },
      {
        q: "What should I do if I receive the wrong product?",
        a: "If you received an incorrect item, please contact us within 48 hours of delivery with your order number and a photo of the product received. We will arrange a replacement or full refund promptly.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns, Exchanges & Refunds",
    faqs: [
      {
        q: "What should I do if I receive a damaged product?",
        a: "Please contact us within 48 hours of delivery with clear photos of the damage and your order details. We will offer a replacement or refund at no extra cost.",
      },
      {
        q: "How can I return a product if I change my mind?",
        a: "We accept returns within 7 days of delivery, provided the item is unused, in its original packaging with tags intact. Contact support@kibana.in to initiate the process.",
      },
      {
        q: "What is your return and exchange policy?",
        a: "Items can be returned or exchanged within 7 days of delivery. Products must be unused, undamaged, and in original packaging. Sale items and customised products are non-returnable.",
      },
      {
        q: "Do I need to pay for return shipping?",
        a: "Return shipping is free for defective or incorrect items. For change-of-mind returns, a nominal return shipping fee may apply depending on your location.",
      },
      {
        q: "How do I initiate an online return?",
        a: "Email us at support@kibana.in with your order number, reason for return, and photos if applicable. Our team will guide you through the process within 24 hours.",
      },
      {
        q: "How will I receive my refund?",
        a: "Refunds are credited to your original payment method within 5–7 business days after we receive and inspect the returned item.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    faqs: [
      {
        q: "How long does shipping take?",
        a: "Standard delivery within India takes 4–7 business days. Express delivery (2–3 business days) is available in select cities at an additional charge.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently we ship across India. International shipping is coming soon — sign up for our newsletter to be the first to know.",
      },
      {
        q: "What shipping methods are available?",
        a: "We offer Standard Shipping (4–7 days) and Express Shipping (2–3 days) through trusted courier partners including Delhivery, Blue Dart, and Xpressbees.",
      },
      {
        q: "Where do you deliver within India?",
        a: "We deliver to all major cities and most pin codes across India. Enter your pin code at checkout to confirm serviceability.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Credit Cards, Debit Cards, Net Banking, UPI (GPay, PhonePe, Paytm), and Cash on Delivery (COD) for eligible orders.",
      },
      {
        q: "Which credit cards are accepted (domestic & international)?",
        a: "We accept all major domestic and international credit cards including Visa, Mastercard, American Express, and RuPay.",
      },
      {
        q: "Which domestic debit cards are accepted?",
        a: "All Visa, Mastercard, and RuPay debit cards issued by Indian banks are accepted.",
      },
      {
        q: "Which banks are supported for net banking?",
        a: "We support net banking for all major Indian banks including SBI, HDFC, ICICI, Axis, Kotak, Yes Bank, and more.",
      },
      {
        q: "Is Cash on Delivery (COD) available?",
        a: "Yes, COD is available on orders up to ₹5,000 for select pin codes. Availability is shown at checkout based on your delivery address.",
      },
    ],
  },
  {
    id: "products",
    title: "Products & Materials",
    faqs: [
      {
        q: "What materials are your bags made from?",
        a: "All Kibana bags are made from 100% premium vegan leather — a high-quality synthetic material that is durable, smooth, and cruelty-free.",
      },
      {
        q: "What does \"vegan leather\" mean?",
        a: "Vegan leather is a synthetic alternative to animal leather. It looks and feels like genuine leather but is entirely free from animal products, making it an ethical and sustainable choice.",
      },
      {
        q: "How are your products made?",
        a: "Every Kibana bag is crafted at our own in-house manufacturing facility by a team of skilled professionals. Significant handwork is involved in detailing and finishing to ensure premium quality.",
      },
      {
        q: "Are the bags waterproof?",
        a: "Our vegan leather bags are water-resistant and can handle light splashes. However, we recommend avoiding prolonged exposure to heavy rain or submerging them in water.",
      },
      {
        q: "Are the bags washable?",
        a: "We recommend wiping the surface with a dry or slightly damp cloth. Do not machine-wash or soak the bags, as this may damage the material and stitching.",
      },
    ],
  },
  {
    id: "general",
    title: "General Information",
    faqs: [
      {
        q: "Is my personal information secure?",
        a: "Yes. We use industry-standard SSL encryption and never share your personal data with third parties without your consent. See our Privacy Policy for full details.",
      },
      {
        q: "Who should I contact for queries or support?",
        a: "You can reach our support team at support@kibana.in or via WhatsApp. We typically respond within 24 business hours.",
      },
      {
        q: "How often is the website updated with new products?",
        a: "We regularly launch new designs and collections. Subscribe to our newsletter or follow us on Instagram to stay updated on new arrivals.",
      },
      {
        q: "What can I do if an item is out of stock?",
        a: "If an item is out of stock, you can use the 'Notify Me' option on the product page (coming soon) or email us — we'll let you know as soon as it's back.",
      },
    ],
  },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-kibana-ink/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-6 py-5 text-left group"
      >
        <span
          className={cn(
            "text-sm leading-snug transition-colors duration-200",
            open
              ? "text-kibana-camel font-medium"
              : "text-kibana-ink font-normal group-hover:text-kibana-camel"
          )}
        >
          {faq.q}
        </span>
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-kibana-tan">
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-72 pb-6" : "max-h-0"
        )}
      >
        <p className="text-[13px] text-kibana-ink/55 leading-[1.8] max-w-2xl">
          {faq.a}
        </p>
      </div>
    </div>
  );
}

export default function FAQsPage() {
  const [activeId, setActiveId] = useState("orders");
  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const activeIndex = categories.findIndex((c) => c.id === activeId);

  return (
    <main className="bg-kibana-cream text-kibana-ink">

      {/* ── Hero ── */}
      <section className="relative bg-kibana-ink overflow-hidden">
        <div className="container relative py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            {/* Left — heading */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-kibana-tan mb-3">
                Help Centre
              </p>
              <h1 className="font-bold uppercase tracking-[0.15em] text-xl sm:text-2xl md:text-3xl text-kibana-cream leading-snug">
                Frequently <span className="text-kibana-tan">Asked</span> Questions
              </h1>
              <p className="text-kibana-cream/40 text-xs mt-3 max-w-xs leading-relaxed">
                Browse by topic or use the tabs below to jump to a section.
              </p>
            </div>

            {/* Right — stats */}
            <div className="flex gap-4 md:gap-6">
              {[
                { n: "6", label: "Topics" },
                { n: "27", label: "Answers" },
                { n: "24h", label: "Response Time" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="border border-kibana-cream/10 rounded px-4 py-3 text-center bg-kibana-cream/5 min-w-[70px]"
                >
                  <div className="text-kibana-tan font-bold text-xl md:text-2xl leading-none">{s.n}</div>
                  <div className="text-kibana-cream/40 text-[8px] uppercase tracking-[0.25em] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Category tab strip ── */}
      <section className="bg-kibana-stone border-b border-kibana-ink/8 sticky top-[110px] md:top-16 z-10">
        <div className="container">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((cat, i) => {
              const isActive = cat.id === activeId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveId(cat.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2.5 px-4 md:px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all duration-150 whitespace-nowrap",
                    isActive
                      ? "border-kibana-tan text-kibana-ink"
                      : "border-transparent text-kibana-ink/40 hover:text-kibana-ink/70 hover:border-kibana-tan/30"
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors",
                      isActive
                        ? "bg-kibana-tan text-kibana-ink"
                        : "bg-kibana-ink/10 text-kibana-ink/40"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{cat.title}</span>
                  <span className="sm:hidden">{cat.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ content ── */}
      <section className="container py-10 md:py-14">
        <div className="max-w-3xl">

          {/* Section header */}
          <div className="mb-8 md:mb-10">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-[10px] font-bold text-kibana-tan/60 tabular-nums">
                {String(activeIndex + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
              </span>
              <h2 className="font-bold uppercase tracking-[0.15em] text-sm md:text-base text-kibana-ink">
                {active.title}
              </h2>
              <span className="ml-auto text-[10px] text-kibana-ink/35 font-medium tabular-nums">
                {active.faqs.length} {active.faqs.length === 1 ? "question" : "questions"}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-[1px] bg-kibana-ink/10 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-kibana-tan transition-all duration-500"
                style={{ width: `${((activeIndex + 1) / categories.length) * 100}%` }}
              />
            </div>
          </div>

          {/* FAQ accordion */}
          <div>
            {active.faqs.map((faq) => (
              <FAQItem key={faq.q} faq={faq} />
            ))}
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-kibana-ink/8">
            <button
              onClick={() => {
                const prev = categories[activeIndex - 1];
                if (prev) setActiveId(prev.id);
              }}
              disabled={activeIndex === 0}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                activeIndex === 0
                  ? "text-kibana-ink/20 cursor-not-allowed"
                  : "text-kibana-ink/50 hover:text-kibana-ink"
              )}
            >
              ← {activeIndex > 0 ? categories[activeIndex - 1].title.split(" ")[0] : "Prev"}
            </button>
            <button
              onClick={() => {
                const next = categories[activeIndex + 1];
                if (next) setActiveId(next.id);
              }}
              disabled={activeIndex === categories.length - 1}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                activeIndex === categories.length - 1
                  ? "text-kibana-ink/20 cursor-not-allowed"
                  : "text-kibana-ink/50 hover:text-kibana-ink"
              )}
            >
              {activeIndex < categories.length - 1
                ? categories[activeIndex + 1].title.split(" ")[0]
                : "Next"}{" "}
              →
            </button>
          </div>
        </div>
      </section>

      {/* ── Contact strip ── */}
      <section className="bg-kibana-ink mt-2">
        <div className="container py-12 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 max-w-4xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-kibana-tan mb-2">
                Still need help?
              </p>
              <h2 className="font-bold uppercase tracking-[0.1em] text-lg md:text-xl text-kibana-cream">
                Our team is ready to assist
              </h2>
              <p className="text-kibana-cream/35 text-xs mt-1.5 leading-relaxed max-w-sm">
                We respond within 24 business hours, Monday to Saturday.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href="mailto:support@kibana.in"
                className="inline-block bg-kibana-tan text-kibana-ink font-bold text-[10px] uppercase tracking-[0.25em] px-8 py-3.5 hover:bg-kibana-camel transition-colors duration-200 text-center"
              >
                Email Support
              </a>
              <Link
                href="/shop"
                className="inline-block border border-kibana-cream/20 text-kibana-cream/70 font-bold text-[10px] uppercase tracking-[0.25em] px-8 py-3.5 hover:border-kibana-cream/50 hover:text-kibana-cream transition-colors duration-200 text-center"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
