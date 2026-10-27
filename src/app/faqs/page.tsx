"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackPageView } from "@/components/analytics/track-page-view";

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
        q: 'What does "vegan leather" mean?',
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
    <div className="border-b border-border/30">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span
          className={cn(
            "text-base font-medium leading-relaxed transition-colors duration-200",
            open ? "text-accent" : "text-foreground group-hover:text-accent",
          )}
        >
          {faq.q}
        </span>
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-accent">
          {open ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-96 pb-6" : "max-h-0",
        )}
      >
        <p className="max-w-2xl text-sm font-light leading-relaxed text-muted-foreground">
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
    <main className="bg-background text-foreground">
      <TrackPageView pageName="FAQs" pageType="faqs" />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="storefront-section-space container relative max-w-[1600px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            {/* Left */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
                Help Centre
              </p>
              <h1 className="mb-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
                Frequently Asked <span className="text-accent">Questions</span>
              </h1>
              <p className="max-w-sm text-sm text-background/70">
                Browse by topic or use the tabs below to find what you need.
              </p>
            </div>

            {/* Right — Stats */}
            <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-4 lg:shrink-0 lg:gap-6">
              {[
                { n: "6", label: "Topics" },
                { n: "27", label: "Answers" },
                { n: "24h", label: "Response" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="min-w-0 border border-background/20 px-2 py-4 text-center sm:px-4"
                >
                  <div className="text-2xl font-semibold leading-none text-accent">{s.n}</div>
                  <div className="mt-2 break-words text-[10px] font-medium uppercase tracking-wider text-background/60 sm:text-xs sm:tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-16 z-10 border-b border-border/30 bg-accent/5 lg:top-[78px]">
        <div className="container max-w-[1600px]">
          <div className="scrollbar-hide flex overflow-x-auto">
            {categories.map((cat, i) => {
              const isActive = cat.id === activeId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveId(cat.id)}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-3 whitespace-nowrap border-b-2 px-5 py-4 text-sm font-semibold uppercase tracking-widest transition-all duration-200 md:px-6",
                    isActive
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                      isActive ? "bg-accent text-background" : "bg-border text-muted-foreground",
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

      {/* FAQ Content */}
      <section className="storefront-section-space container max-w-[1600px]">
        <div className="max-w-4xl">
          {/* Section Header */}
          <div className="mb-12">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="text-sm font-semibold tabular-nums text-accent/70">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(categories.length).padStart(2, "0")}
              </span>
              <h2 className="min-w-0 break-words font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {active.title}
              </h2>
              <span className="ml-auto text-sm font-medium tabular-nums text-muted-foreground">
                {active.faqs.length} {active.faqs.length === 1 ? "question" : "questions"}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="relative h-px overflow-hidden bg-border">
              <div
                className="absolute inset-y-0 left-0 bg-accent transition-all duration-500"
                style={{ width: `${((activeIndex + 1) / categories.length) * 100}%` }}
              />
            </div>
          </div>

          {/* FAQ Accordion */}
          <div>
            {active.faqs.map((faq) => (
              <FAQItem key={faq.q} faq={faq} />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between border-t border-border/30 pt-8">
            <button
              onClick={() => {
                const prev = categories[activeIndex - 1];
                if (prev) setActiveId(prev.id);
              }}
              disabled={activeIndex === 0}
              className={cn(
                "text-sm font-semibold uppercase tracking-widest transition-colors",
                activeIndex === 0
                  ? "cursor-not-allowed text-muted-foreground/30"
                  : "text-muted-foreground hover:text-accent",
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
                "text-sm font-semibold uppercase tracking-widest transition-colors",
                activeIndex === categories.length - 1
                  ? "cursor-not-allowed text-muted-foreground/30"
                  : "text-muted-foreground hover:text-accent",
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

      {/* Contact CTA */}
      <section className="mt-8 bg-foreground text-background">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-12 sm:px-5 md:px-6 md:py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                Still need help?
              </p>
              <h2 className="mb-4 font-display text-3xl font-semibold">
                Our team is ready to assist
              </h2>
              <p className="max-w-sm text-lg font-light leading-relaxed text-background/70">
                We respond within 24 business hours, Monday to Saturday.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col gap-4 sm:flex-row">
              <a
                href="mailto:support@kibana.in"
                className="inline-flex items-center justify-center bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-widest text-foreground transition-all hover:bg-accent/90"
              >
                Email Support
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center border-2 border-background/20 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-background transition-all hover:border-background/40"
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
