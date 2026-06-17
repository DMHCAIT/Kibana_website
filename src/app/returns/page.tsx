import type { ElementType } from "react";
import type { Metadata } from "next";
import { AlertTriangle, RefreshCcw, XCircle, RotateCcw, Globe, Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns, Refunds & Exchanges — Kibana",
  description:
    "Kibana's policy on returns, refunds, exchanges and cancellations. Learn how we handle your orders.",
};

export default function ReturnsPage() {
  return (
    <main className="bg-kibana-cream text-kibana-ink">
      {/* ── Hero ── */}
      <section className="bg-kibana-ink">
        <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between md:py-14">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-6 bg-kibana-tan" />
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-kibana-tan">
                Policies
              </p>
            </div>
            <h1 className="text-2xl font-bold uppercase leading-tight tracking-[0.12em] text-kibana-cream sm:text-3xl">
              Returns &amp; Refunds
              <br />
              <span className="text-kibana-tan">Exchanges</span>{" "}
              <span className="text-kibana-tan">Policy</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-kibana-cream/70">
              We want you to love every Kibana product. If something isn't right, here's everything
              you need to know.
            </p>
          </div>
          {/* Timeline stats */}
          <div className="flex gap-3 md:flex-col md:gap-4">
            {[
              { n: "7", unit: "Days", label: "Return window" },
              { n: "48", unit: "Hours", label: "Exchange window" },
              { n: "3–4", unit: "Days", label: "Refund processing" },
            ].map((s) => (
              <div
                key={s.label}
                className="min-w-[80px] flex-1 rounded border border-kibana-cream/10 bg-kibana-cream/5 px-4 py-3 text-center md:flex-none"
              >
                <div className="text-xl font-bold leading-none text-kibana-tan md:text-2xl">
                  {s.n}
                </div>
                <div className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-kibana-cream/60">
                  {s.unit}
                </div>
                <div className="mt-1 hidden text-[8px] uppercase tracking-[0.15em] text-kibana-cream/35 md:block">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick nav ── */}
      <div className="sticky top-[110px] z-10 border-b border-kibana-ink/10 bg-kibana-stone md:top-16">
        <div className="container">
          <div className="scrollbar-hide flex overflow-x-auto">
            {[
              { id: "return", label: "Return" },
              { id: "refund", label: "Refund" },
              { id: "exchange", label: "Exchange" },
              { id: "international", label: "International" },
              { id: "cancellation", label: "Cancellation" },
              { id: "notice", label: "Notice" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex-shrink-0 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-kibana-ink/50 transition-all hover:border-kibana-tan/60 hover:text-kibana-ink"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container max-w-3xl space-y-16 py-12 md:py-16">
        {/* ─ Return ─ */}
        <section id="return" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={RotateCcw} num="01" tag="Return" title="Return Policy" />
          <div className="space-y-6">
            <ImportantBanner text="Items purchased during sales or special events are not eligible for return or refund." />
            <SubSection
              title="Eligibility Criteria"
              points={[
                "The item must be unused, unworn, and in original condition.",
                "All original packaging must be intact, including dust bags, tags, and accessories.",
                "The return request must be initiated within 7 days of delivery.",
                "A valid proof of purchase (order number or receipt) must be provided.",
              ]}
            />
            <SubSection
              title="Non-Returnable Items"
              dotColor="red"
              points={["Items that show signs of use, damage, or odor."]}
            />
          </div>
        </section>

        {/* ─ Refund ─ */}
        <section id="refund" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={RefreshCcw} num="02" tag="Refund" title="Refund Policy" />
          <div className="space-y-6">
            <ImportantBanner text="Items purchased during sales or special events are not eligible for return or refund." />
            <SubSection
              title="Inspection Process"
              points={[
                "All returned items are subject to quality inspection upon receipt.",
                "Customers will be notified of the approval or rejection of their refund request.",
              ]}
            />
            <SubSection
              title="Refund Process"
              points={[
                "Approved refunds will be credited to the original payment method.",
                "Refunds are typically processed within 3–4 business days after approval.",
              ]}
            />
            <SubSection
              title="Applicable Deductions"
              note="Refund amounts may exclude:"
              dotColor="red"
              points={[
                "Shipping charges, except in cases of damaged or incorrect items.",
                "Return shipping costs, unless the return is due to an error on our part.",
              ]}
            />
            <SubSection
              title="Late or Missing Refunds"
              note="If you have not received your refund:"
              points={[
                "Verify your bank account statement.",
                "Contact your credit card provider or banking institution.",
                "If the issue remains unresolved, email us at support@kibanalife.com.",
              ]}
            />
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-kibana-tan">
                Return Shipping Guidelines
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Ensure the item is securely packed in its original packaging.",
                  "Include your order number and contact information within the package.",
                  "Use a trackable and insured shipping service.",
                  "KIBANA shall not be liable for lost or undelivered return shipments.",
                ].map((p) => (
                  <div
                    key={p}
                    className="border-kibana-ink/8 flex items-start gap-2.5 border bg-kibana-stone px-3 py-3"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kibana-tan" />
                    <span className="text-sm leading-snug text-kibana-ink/75">{p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border border-kibana-tan/30 bg-kibana-tan/5 px-4 py-4">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-kibana-tan">
                  Send Returns To
                </p>
                <p className="text-sm leading-relaxed text-kibana-ink/80">
                  House No. 1, 2nd Floor, KH.No. 581/2,
                  <br />
                  Village Sultanpur, New Delhi – 110030
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─ Exchange ─ */}
        <section id="exchange" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={RefreshCcw} num="03" tag="Exchange" title="Exchange Policy" />
          <div className="space-y-6">
            <SubSection
              title="Eligible Conditions"
              points={[
                "Incorrect item received.",
                "Items received are defective or damaged.",
                "Size or color exchange, subject to stock availability.",
              ]}
            />
            <SubSection
              title="Request Timeline"
              points={[
                "Exchange requests must be raised within 48 hours of delivery.",
                "For damaged or incorrect items, customers must share clear photographs and an unboxing video as proof.",
              ]}
            />
            <SubSection
              title="Damaged or Defective Items"
              points={[
                "Capture clear photos and an unboxing video of the damaged item, including the product and packaging.",
                "Email us within 48 hours of delivery at support@kibanalife.com with the evidence.",
                "Upon verification, we will arrange a replacement or full refund at no additional cost.",
              ]}
            />
          </div>
        </section>

        {/* ─ International ─ */}
        <section id="international" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={Globe} num="04" tag="International" title="International Policy" />
          <div className="space-y-6">
            <div className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm font-semibold text-red-700">
                Kibana does NOT accept international returns.
              </p>
            </div>
            <SubSection
              title="Refund Policy"
              points={[
                "Refund only after inspection / quality check.",
                "Refund goes to original payment method.",
                "Processing time: Usually 5–14 days after approval.",
              ]}
            />
            <SubSection
              title="Important — Refund Exclusions"
              dotColor="red"
              points={[
                "Shipping charges are mostly non-refundable.",
                "Import taxes / customs are never refunded.",
              ]}
            />
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-kibana-tan">
                Exchange Policy
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-kibana-ink/50">
                    Allowed When
                  </p>
                  <ul className="space-y-2">
                    {["You received a damaged item.", "You received the wrong product."].map(
                      (p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-kibana-ink/75">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-kibana-tan" />
                          {p}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-kibana-ink/50">
                    Restrictions
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Exchange is one-time only.",
                      "You are responsible for return shipping costs.",
                      "Customs duties are NOT paid by us.",
                    ].map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-kibana-ink/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─ Cancellation ─ */}
        <section id="cancellation" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={XCircle} num="05" tag="Cancellation" title="Cancellation Policy" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden border border-kibana-ink/10">
              <div className="flex items-center gap-2 bg-kibana-ink px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-kibana-tan" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kibana-cream">
                  Before Shipment
                </p>
              </div>
              <div className="bg-white/40 px-4 py-4">
                <p className="text-sm leading-relaxed text-kibana-ink/75">
                  Orders can be canceled within{" "}
                  <strong className="text-kibana-ink">12 hours</strong> of placement by contacting{" "}
                  <a
                    href="mailto:support@kibanalife.com"
                    className="break-all text-kibana-camel underline underline-offset-2"
                  >
                    support@kibanalife.com
                  </a>{" "}
                  with your order number. A full refund will be issued if the order has not been
                  processed or shipped.
                </p>
              </div>
            </div>
            <div className="overflow-hidden border border-kibana-ink/10">
              <div className="flex items-center gap-2 border-b border-kibana-ink/10 bg-kibana-stone px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kibana-ink/70">
                  After Shipment
                </p>
              </div>
              <div className="bg-white/40 px-4 py-4">
                <p className="text-sm leading-relaxed text-kibana-ink/75">
                  Orders <strong className="text-kibana-ink">cannot be canceled</strong> once
                  shipped. However, returns can be requested after delivery as per our Return &amp;
                  Refund Policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─ Important Notice ─ */}
        <section id="notice" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={AlertTriangle} num="06" tag="Notice" title="Important Notice" />
          <ul className="space-y-3">
            {[
              "Claims cannot be accepted without a valid unboxing video as proof.",
              "Claims reported after the return/replacement window will not be processed.",
              "If the outer packaging is slightly damaged, please ensure the delivery agent records it on the delivery slip at the time of acceptance.",
              "Once a delivery is accepted without proper documentation, we may not be able to process damage-related claims.",
            ].map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 border-l-2 border-kibana-tan bg-kibana-tan/5 px-4 py-3"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kibana-tan" />
                <span className="text-sm leading-relaxed text-kibana-ink/80">{p}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Contact CTA ── */}
      <section className="bg-kibana-ink">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-kibana-tan" />
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-kibana-tan">
              Need Help?
            </p>
          </div>
          <h2 className="mb-6 text-lg font-bold uppercase tracking-[0.15em] text-kibana-cream sm:text-xl">
            Any Issue? We're Here to Help.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:support@kibanalife.com"
              className="inline-flex items-center gap-3 border border-kibana-cream/20 px-5 py-3 text-sm text-kibana-cream transition-colors hover:bg-kibana-cream/10"
            >
              <Mail className="h-4 w-4 shrink-0 text-kibana-tan" />
              support@kibanalife.com
            </a>
            <a
              href="tel:+919711414110"
              className="inline-flex items-center gap-3 border border-kibana-cream/20 px-5 py-3 text-sm text-kibana-cream transition-colors hover:bg-kibana-cream/10"
            >
              <Phone className="h-4 w-4 shrink-0 text-kibana-tan" />
              +91 9711414110
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Reusable sub-components ── */

function SectionHeader({
  icon: Icon,
  num,
  tag,
  title,
}: {
  icon: ElementType;
  num: string;
  tag: string;
  title: string;
}) {
  return (
    <div className="mb-7 flex items-center gap-4 border-b border-kibana-ink/10 pb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-kibana-ink">
        <Icon className="h-4 w-4 text-kibana-tan" />
      </div>
      <div>
        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.35em] text-kibana-tan">
          {num} — {tag}
        </p>
        <h2 className="text-base font-bold uppercase tracking-[0.15em] text-kibana-ink sm:text-lg">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ImportantBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 border-l-2 border-kibana-tan bg-kibana-tan/10 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-kibana-tan" />
      <div>
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-kibana-camel">
          Important
        </p>
        <p className="text-sm text-kibana-ink/80">{text}</p>
      </div>
    </div>
  );
}

function SubSection({
  title,
  points,
  note,
  dotColor = "tan",
}: {
  title: string;
  points: string[];
  note?: string;
  dotColor?: "tan" | "red";
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-kibana-tan">
        {title}
      </p>
      {note && <p className="mb-2 text-xs text-kibana-ink/50">{note}</p>}
      <ul className="space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-kibana-ink/75">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor === "red" ? "bg-red-400" : "bg-kibana-tan"}`}
            />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
