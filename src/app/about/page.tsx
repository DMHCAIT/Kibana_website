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
    image: "/extracted/img-016.jpg",
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
    image: "/extracted/img-014.jpg",
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
    image: "/extracted/img-060.jpg",
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
    image: "/extracted/img-100.jpg",
    reverse: true,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-kibana-cream text-kibana-ink">

      {/* ── Hero ── */}
      <section className="relative h-52 sm:h-72 md:h-[400px] overflow-hidden">
        <Image
          src="/extracted/img-102.jpg"
          alt="Kibana — Our Story"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-kibana-cream/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-[10px] tracking-[0.5em] uppercase text-kibana-camel font-medium mb-2">Our Story</p>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-kibana-ink leading-tight">
            Style With Purpose
          </h1>
          <div className="mt-4 w-12 h-px bg-kibana-tan" />
        </div>
      </section>

      {/* ── Intro ── */}
      <div className="container py-8 md:py-12 max-w-2xl text-center mx-auto">
        <p className="text-sm sm:text-base text-kibana-ink/60 leading-relaxed">
          Kibana was born from a simple belief — that luxury should never come at the cost of ethics. Every bag we make is a statement: beautiful, purposeful, and kind to the world.
        </p>
      </div>

      {/* ── Story sections ── */}
      <div className="container py-10 md:py-16 space-y-12 md:space-y-16">
        {sections.map((sec, i) => (
          <section
            key={sec.id}
            className={`flex flex-col md:flex-row gap-6 md:gap-12 ${
              sec.reverse ? "md:flex-row-reverse" : ""
            } items-center`}
          >
            {/* Image */}
            <div className="w-full md:w-[45%] flex-shrink-0">
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={sec.image}
                  alt={sec.heading}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 flex flex-col gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-kibana-camel">
                {String(i + 1).padStart(2, "0")} — {sec.tag}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-kibana-ink leading-tight">
                {sec.heading}
              </h2>
              <div className="w-8 h-px bg-kibana-tan" />
              <ul className="space-y-2.5 mt-1">
                {sec.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-xs sm:text-sm text-kibana-ink/65">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-kibana-tan" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      {/* ── Values strip ── */}
      <section className="bg-kibana-stone">
        <div className="container py-8 md:py-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-kibana-camel mb-2">Our Values</p>
          <h2 className="font-display text-2xl sm:text-3xl text-kibana-ink mb-8">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {[
              { num: "01", title: "Cruelty-Free", desc: "Zero animal products. Maximum luxury feel — for a world that deserves better." },
              { num: "02", title: "Timeless Design", desc: "Pieces that transcend trends and stay relevant season after season." },
              { num: "03", title: "Handcrafted", desc: "Expert artisans finish every stitch, clasp, and edge by hand." },
            ].map((v) => (
              <div key={v.title} className="flex flex-col gap-2 border-t-2 border-kibana-tan pt-4">
                <p className="font-display text-3xl text-kibana-tan/60">{v.num}</p>
                <h3 className="font-bold uppercase tracking-[0.15em] text-kibana-ink text-xs">{v.title}</h3>
                <p className="text-kibana-ink/55 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-kibana-cream py-10 md:py-14 text-center px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-kibana-camel mb-2">Ready to Explore?</p>
        <h2 className="font-display text-2xl sm:text-3xl text-kibana-ink mb-6">
          Find Your Perfect Kibana
        </h2>
        <Link
          href="/shop"
          className="inline-block bg-kibana-ink text-kibana-cream font-bold text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-kibana-camel transition-colors duration-300"
        >
          Shop the Collection
        </Link>
      </section>

    </main>
  );
}



