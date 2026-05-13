import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story — Kibana",
  description:
    "Discover the story behind Kibana — a luxury vegan leather handbag brand crafted for modern life.",
};

const sections = [
  {
    id: "startup",
    tag: "Est. 2024",
    heading: "Where It All Began",
    points: [
      "Founded in 2024 for men & women who appreciate style with purpose.",
      "Designed for every occasion — office, daily use, parties & weddings.",
      "Bags that are functional and elevate personal style.",
    ],
    image: "/extracted/img-004.jpg",
    reverse: false,
  },
  {
    id: "material",
    tag: "Material",
    heading: "100% Premium Vegan Leather",
    points: [
      "Carefully selected for durability and smooth texture.",
      "Delivers a luxurious look without compromise.",
      "Long-lasting performance ideal for everyday modern use.",
    ],
    image: "/extracted/img-012.jpg",
    reverse: true,
  },
  {
    id: "design",
    tag: "Design",
    heading: "Every Piece Has a Story",
    points: [
      "Each bag has a unique concept and meaning behind it.",
      "Inspired by real lifestyles, trends, and individuality.",
      "Timeless appeal that stays relevant beyond seasonal trends.",
    ],
    image: "/extracted/img-020.jpg",
    reverse: false,
  },
  {
    id: "craft",
    tag: "Craftsmanship",
    heading: "Made by Skilled Hands",
    points: [
      "Crafted at our own in-house manufacturing facility.",
      "Expert handwork in every detail and finishing.",
      "Precision and character in every single piece.",
    ],
    image: "/extracted/img-028.jpg",
    reverse: true,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-kibana-cream text-kibana-ink">

      {/* ── Hero — full image, no text ── */}
      <section className="relative h-48 sm:h-64 md:h-[360px] lg:h-[460px] overflow-hidden">
        <Image
          src="/extracted/img-000.jpg"
          alt="Kibana — Our Story"
          fill
          className="object-cover object-center"
          priority
        />
      </section>

      {/* ── Page title below hero ── */}
      <div className="container pt-6 pb-2">
        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-kibana-tan mb-1">Our Story</p>
        <h1 className="font-bold uppercase tracking-[0.12em] text-lg sm:text-xl md:text-2xl text-kibana-ink">
          Style With <span className="font-playfair italic normal-case text-kibana-tan">Purpose</span>
        </h1>
      </div>

      {/* ── Story sections ── */}
      <div className="container py-8 md:py-12 space-y-10 md:space-y-14">
        {sections.map((sec, i) => (
          <section
            key={sec.id}
            className={`flex flex-col md:flex-row gap-6 md:gap-10 ${
              sec.reverse ? "md:flex-row-reverse" : ""
            } items-center`}
          >
            {/* Image */}
            <div className="w-full md:w-[38%] flex-shrink-0">
              <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                <Image
                  src={sec.image}
                  alt={sec.heading}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 38vw"
                />
              </div>
            </div>

            {/* Text */}
            <div className={`flex-1 flex flex-col justify-center gap-3 pt-4 md:pt-0 ${sec.reverse ? "md:pr-8" : "md:pl-8"}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-kibana-tan">
                {String(i + 1).padStart(2, "0")} — {sec.tag}
              </p>
              <h2 className="font-bold uppercase tracking-[0.12em] text-sm sm:text-base md:text-lg text-kibana-ink leading-snug">
                {sec.heading}
              </h2>
              <ul className="space-y-2 mt-1">
                {sec.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-xs md:text-sm text-kibana-ink/70">
                    <span className="text-kibana-tan mt-0.5 text-[10px]">▸</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      {/* ── Values strip ── */}
      <section className="bg-kibana-ink text-kibana-cream">
        <div className="container py-8 md:py-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-kibana-tan mb-1">Our Values</p>
          <h2 className="font-bold uppercase tracking-[0.15em] text-sm md:text-base text-kibana-cream mb-6">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {[
              { num: "01", title: "Cruelty-Free", desc: "Zero animal products. Maximum luxury feel." },
              { num: "02", title: "Timeless Design", desc: "Pieces that transcend trends and stay relevant." },
              { num: "03", title: "Handcrafted", desc: "Expert artisans finish every detail by hand." },
            ].map((v) => (
              <div key={v.title} className="border border-kibana-cream/10 p-5">
                <p className="font-playfair text-2xl text-kibana-tan mb-2">{v.num}</p>
                <h3 className="font-bold uppercase tracking-[0.15em] text-kibana-cream text-xs mb-1">{v.title}</h3>
                <p className="text-kibana-cream/50 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-kibana-stone py-8 md:py-10 text-center px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-kibana-tan mb-1">Ready to Explore?</p>
        <h2 className="font-bold uppercase tracking-[0.15em] text-sm md:text-base text-kibana-ink mb-4">
          Find Your Perfect Kibana
        </h2>
        <Link
          href="/shop"
          className="inline-block bg-kibana-ink text-kibana-cream font-bold text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-kibana-ink/80 transition-colors"
        >
          Shop the Collection
        </Link>
      </section>

    </main>
  );
}



