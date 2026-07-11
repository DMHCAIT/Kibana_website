import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrackPageView } from "@/components/analytics/track-page-view";

export const metadata: Metadata = {
  title: "Our Story — Kibana",
  description:
    "Discover the story behind Kibana — a luxury vegan leather handbag brand crafted for modern life.",
};

const sections = [
  {
    id: "startup",
    tag: "Est. 2024",
    heading: "Startup Idea & Year",
    paragraphs: [
      "Kibana, established in 2024, is a luxury-inspired handbag brand created for both men and women who appreciate style with purpose. Our vision is to design versatile bags that seamlessly fit into every aspect of life - from office wear and daily use to parties, weddings, and special occasions. We aim to create pieces that are not just functional, but also elevate personal style.",
    ],
    image: "/extracted/img-016.jpg",
    reverse: false,
  },
  {
    id: "material",
    tag: "Material",
    heading: "Material",
    paragraphs: [
      "At Kibana, we use 100% premium Vegan leather, carefully selected for its durability, smooth texture, and refined appearance. This material allows us to deliver a luxurious look while ensuring practicality and long-lasting performance, making our bags ideal for everyday modern use.",
    ],
    image: "/extracted/img-014.jpg",
    reverse: true,
  },
  {
    id: "design",
    tag: "Design",
    heading: "Design",
    paragraphs: [
      "Every Kibana bag is thoughtfully designed with a unique concept and meaning behind it. Our designs are inspired by real lifestyles, trends, and individuality, ensuring each piece stands out. We focus on creating bags that combine elegance, functionality, and timeless appeal, so they remain relevant beyond seasonal trends.",
    ],
    image: "/extracted/img-060.jpg",
    reverse: false,
  },
  {
    id: "craft",
    tag: "Craftsmanship",
    heading: "How Bags Are Formed",
    paragraphs: [
      "All Kibana bags are crafted at our own manufacturing facility by a dedicated team of skilled professionals. A significant part of the process involves expert handwork, especially in detailing and finishing, which adds precision and character to every piece. This blend of careful craftsmanship and attention to detail ensures that each bag meets high standards of quality and carries a distinctive, premium feel.",
    ],
    image: "/extracted/img-100.jpg",
    reverse: true,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-kibana-cream text-kibana-ink">
      <TrackPageView pageName="About" pageType="about" />
      {/* ── Hero ── */}
      <section className="relative h-52 overflow-hidden sm:h-72 md:h-[400px]">
        <Image
          src="/extracted/img-102.jpg"
          alt="Kibana — Our Story"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-kibana-cream/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.45em] text-kibana-camel sm:text-sm md:text-base">
            Our Story
          </p>
          <h1 className="font-display text-3xl leading-tight text-kibana-ink sm:text-5xl md:text-6xl">
            Style With Purpose
          </h1>
          <div className="mt-4 h-px w-12 bg-kibana-tan" />
        </div>
      </section>

      {/* ── Intro ── */}
      <div className="container mx-auto max-w-2xl py-8 text-center md:py-12">
        <p className="text-sm leading-relaxed text-kibana-ink/60 sm:text-base">
          Kibana was born from a simple belief — that luxury should never come at the cost of
          ethics. Every bag we make is a statement: beautiful, purposeful, and kind to the world.
        </p>
      </div>

      {/* ── Story sections ── */}
      <div className="container space-y-12 py-10 md:space-y-16 md:py-16">
        {sections.map((sec, i) => (
          <section
            key={sec.id}
            className={`flex flex-col gap-6 md:flex-row md:gap-12 ${
              sec.reverse ? "md:flex-row-reverse" : ""
            } items-center`}
          >
            {/* Image */}
            <div className="w-full flex-shrink-0 md:w-[45%]">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
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
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-kibana-camel">
                {String(i + 1).padStart(2, "0")} — {sec.tag}
              </p>
              <h2 className="font-display text-2xl leading-tight text-kibana-ink sm:text-3xl md:text-4xl">
                {sec.heading}
              </h2>
              <div className="h-px w-8 bg-kibana-tan" />
              <div className="mt-1 space-y-3">
                {sec.paragraphs.map((pt) => (
                  <p key={pt} className="text-xs leading-relaxed text-kibana-ink/70 sm:text-sm">
                    {pt}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── Values strip ── */}
      <section className="bg-kibana-stone">
        <div className="container py-8 md:py-12">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-kibana-camel">
            Our Values
          </p>
          <h2 className="mb-8 font-display text-2xl text-kibana-ink sm:text-3xl">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-8">
            {[
              {
                num: "01",
                title: "Cruelty-Free",
                desc: "Zero animal products. Maximum luxury feel — for a world that deserves better.",
              },
              {
                num: "02",
                title: "Timeless Design",
                desc: "Pieces that transcend trends and stay relevant season after season.",
              },
              {
                num: "03",
                title: "Handcrafted",
                desc: "Expert artisans finish every stitch, clasp, and edge by hand.",
              },
            ].map((v) => (
              <div key={v.title} className="flex flex-col gap-2 border-t-2 border-kibana-tan pt-4">
                <p className="font-display text-3xl text-kibana-tan/60">{v.num}</p>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-kibana-ink">
                  {v.title}
                </h3>
                <p className="text-xs leading-relaxed text-kibana-ink/55">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-kibana-cream px-5 py-10 text-center md:py-14">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-kibana-camel">
          Ready to Explore?
        </p>
        <h2 className="mb-6 font-display text-2xl text-kibana-ink sm:text-3xl">
          Find Your Perfect Kibana
        </h2>
        <Link
          href="/shop"
          className="inline-block bg-kibana-ink px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-kibana-cream transition-colors duration-300 hover:bg-kibana-camel"
        >
          Shop the Collection
        </Link>
      </section>
    </main>
  );
}
