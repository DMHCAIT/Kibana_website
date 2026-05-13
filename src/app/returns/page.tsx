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
        <div className="container py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-kibana-tan" />
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-kibana-tan">Policies</p>
            </div>
            <h1 className="font-bold uppercase tracking-[0.12em] text-2xl sm:text-3xl text-kibana-cream leading-tight">
              Returns &amp; Refunds<br />
              <span className="text-kibana-tan">Exchanges</span> &amp; Cancellations
            </h1>
            <p className="text-kibana-cream/70 text-sm mt-4 max-w-sm leading-relaxed">
              We want you to love every Kibana product. If something isn't right, here's everything you need to know.
            </p>
          </div>
          {/* Timeline stats */}
          <div className="flex gap-3 md:flex-col md:gap-4">
            {[
              { n: "7", unit: "Days", label: "Return window" },
              { n: "48", unit: "Hours", label: "Exchange window" },
              { n: "3–4", unit: "Days", label: "Refund processing" },
            ].map((s) => (
              <div key={s.label} className="flex-1 md:flex-none border border-kibana-cream/10 rounded px-4 py-3 text-center bg-kibana-cream/5 min-w-[80px]">
                <div className="text-kibana-tan font-bold text-xl md:text-2xl leading-none">{s.n}</div>
                <div className="text-kibana-cream/60 text-[9px] uppercase tracking-[0.2em] mt-0.5">{s.unit}</div>
                <div className="text-kibana-cream/35 text-[8px] uppercase tracking-[0.15em] mt-1 hidden md:block">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick nav ── */}
      <div className="border-b border-kibana-ink/10 bg-kibana-stone sticky top-[110px] md:top-16 z-10">
        <div className="container">
          <div className="flex overflow-x-auto scrollbar-hide">
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
                className="flex-shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-kibana-ink/50 hover:text-kibana-ink border-b-2 border-transparent hover:border-kibana-tan/60 transition-all whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container py-12 md:py-16 max-w-3xl space-y-16">

        {/* ─ Return ─ */}
        <section id="return" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={RotateCcw} num="01" tag="Return" title="Return Policy" />
          <div className="space-y-6">
            <ImportantBanner text="Items purchased during sales or special events are not eligible for return or refund." />
            <SubSection title="Eligibility Criteria" points={[
              "The item must be unused, unworn, and in original condition.",
              "All original packaging must be intact, including dust bags, tags, and accessories.",
              "The return request must be initiated within 7 days of delivery.",
              "A valid proof of purchase (order number or receipt) must be provided.",
            ]} />
            <SubSection title="Non-Returnable Items" dotColor="red" points={[
              "Items that show signs of use, damage, or odor.",
            ]} />
          </div>
        </section>

        {/* ─ Refund ─ */}
        <section id="refund" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={RefreshCcw} num="02" tag="Refund" title="Refund Policy" />
          <div className="space-y-6">
            <ImportantBanner text="Items purchased during sales or special events are not eligible for return or refund." />
            <SubSection title="Inspection Process" points={[
              "All returned items are subject to quality inspection upon receipt.",
              "Customers will be notified of the approval or rejection of their refund request.",
            ]} />
            <SubSection title="Refund Process" points={[
              "Approved refunds will be credited to the original payment method.",
              "Refunds are typically processed within 3–4 business days after approval.",
            ]} />
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
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-kibana-tan mb-3">Return Shipping Guidelines</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Ensure the item is securely packed in its original packaging.",
                  "Include your order number and contact information within the package.",
                  "Use a trackable and insured shipping service.",
                  "KIBANA shall not be liable for lost or undelivered return shipments.",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-2.5 bg-kibana-stone px-3 py-3 border border-kibana-ink/8">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kibana-tan" />
                    <span className="text-sm text-kibana-ink/75 leading-snug">{p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border border-kibana-tan/30 bg-kibana-tan/5 px-4 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-kibana-tan mb-1.5">Send Returns To</p>
                <p className="text-sm text-kibana-ink/80 leading-relaxed">
                  House No. 1, 2nd Floor, KH.No. 581/2,<br />
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
            <SubSection title="Eligible Conditions" points={[
              "Incorrect item received.",
              "Items received are defective or damaged.",
              "Size or color exchange, subject to stock availability.",
            ]} />
            <SubSection title="Request Timeline" points={[
              "Exchange requests must be raised within 48 hours of delivery.",
              "For damaged or incorrect items, customers must share clear photographs and an unboxing video as proof.",
            ]} />
            <SubSection title="Damaged or Defective Items" points={[
              "Capture clear photos and an unboxing video of the damaged item, including the product and packaging.",
              "Email us within 48 hours of delivery at support@kibanalife.com with the evidence.",
              "Upon verification, we will arrange a replacement or full refund at no additional cost.",
            ]} />
          </div>
        </section>

        {/* ─ International ─ */}
        <section id="international" className="scroll-mt-40 md:scroll-mt-28">
          <SectionHeader icon={Globe} num="04" tag="International" title="International Policy" />
          <div className="space-y-6">
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold text-red-700">Kibana does NOT accept international returns.</p>
            </div>
            <SubSection title="Refund Policy" points={[
              "Refund only after inspection / quality check.",
              "Refund goes to original payment method.",
              "Processing time: Usually 5–14 days after approval.",
            ]} />
            <SubSection title="Important — Refund Exclusions" dotColor="red" points={[
              "Shipping charges are mostly non-refundable.",
              "Import taxes / customs are never refunded.",
            ]} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-kibana-tan mb-3">Exchange Policy</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-kibana-ink/50 mb-2">Allowed When</p>
                  <ul className="space-y-2">
                    {["You received a damaged item.", "You received the wrong product."].map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-kibana-ink/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-kibana-tan" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-kibana-ink/50 mb-2">Restrictions</p>
                  <ul className="space-y-2">
                    {[
                      "Exchange is one-time only.",
                      "You are responsible for return shipping costs.",
                      "Customs duties are NOT paid by us.",
                    ].map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-kibana-ink/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />{p}
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-kibana-ink/10 overflow-hidden">
              <div className="bg-kibana-ink px-4 py-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-kibana-tan" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kibana-cream">Before Shipment</p>
              </div>
              <div className="px-4 py-4 bg-white/40">
                <p className="text-sm text-kibana-ink/75 leading-relaxed">
                  Orders can be canceled within <strong className="text-kibana-ink">12 hours</strong> of placement by contacting{" "}
                  <a href="mailto:support@kibanalife.com" className="text-kibana-camel underline underline-offset-2 break-all">
                    support@kibanalife.com
                  </a>{" "}
                  with your order number. A full refund will be issued if the order has not been processed or shipped.
                </p>
              </div>
            </div>
            <div className="border border-kibana-ink/10 overflow-hidden">
              <div className="bg-kibana-stone px-4 py-3 flex items-center gap-2 border-b border-kibana-ink/10">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kibana-ink/70">After Shipment</p>
              </div>
              <div className="px-4 py-4 bg-white/40">
                <p className="text-sm text-kibana-ink/75 leading-relaxed">
                  Orders <strong className="text-kibana-ink">cannot be canceled</strong> once shipped. However, returns can be requested after delivery as per our Return &amp; Refund Policy.
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
              <li key={p} className="flex items-start gap-3 border-l-2 border-kibana-tan bg-kibana-tan/5 px-4 py-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-kibana-tan" />
                <span className="text-sm text-kibana-ink/80 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* ── Contact CTA ── */}
      <section className="bg-kibana-ink">
        <div className="container py-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-6 bg-kibana-tan" />
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-kibana-tan">Need Help?</p>
          </div>
          <h2 className="font-bold uppercase tracking-[0.15em] text-lg sm:text-xl text-kibana-cream mb-6">
            Any Issue? We're Here to Help.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:support@kibanalife.com" className="inline-flex items-center gap-3 border border-kibana-cream/20 px-5 py-3 text-sm text-kibana-cream hover:bg-kibana-cream/10 transition-colors">
              <Mail className="h-4 w-4 text-kibana-tan shrink-0" />
              support@kibanalife.com
            </a>
            <a href="tel:+919711414110" className="inline-flex items-center gap-3 border border-kibana-cream/20 px-5 py-3 text-sm text-kibana-cream hover:bg-kibana-cream/10 transition-colors">
              <Phone className="h-4 w-4 text-kibana-tan shrink-0" />
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
    <div className="flex items-center gap-4 mb-7 pb-5 border-b border-kibana-ink/10">
      <div className="w-10 h-10 bg-kibana-ink flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-kibana-tan" />
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-kibana-tan mb-0.5">
          {num} — {tag}
        </p>
        <h2 className="font-bold uppercase tracking-[0.15em] text-base sm:text-lg text-kibana-ink">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ImportantBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 bg-kibana-tan/10 border-l-2 border-kibana-tan px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-kibana-tan mt-0.5 shrink-0" />
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-kibana-camel mb-1">Important</p>
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
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-kibana-tan mb-3">{title}</p>
      {note && <p className="text-xs text-kibana-ink/50 mb-2">{note}</p>}
      <ul className="space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-kibana-ink/75">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor === "red" ? "bg-red-400" : "bg-kibana-tan"}`} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
