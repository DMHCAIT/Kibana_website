import type { Metadata } from "next";
import Image from "@/components/ui/image";
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
      "Kibana, established in 2024, is a luxury-inspired handbag brand created for women who appreciate style with purpose. Our vision is to design versatile bags that seamlessly fit into every aspect of life - from office wear and daily use to parties, weddings, and special occasions. We aim to create pieces that are not just functional, but also elevate personal style.",
    ],
    image: "/our story images/Startup Idea & Year.jpg",
    reverse: false,
  },
  {
    id: "material",
    tag: "Material",
    heading: "Material",
    paragraphs: [
      "At Kibana, we use 100% premium Vegan leather, carefully selected for its durability, smooth texture, and refined appearance. This material allows us to deliver a luxurious look while ensuring practicality and long-lasting performance, making our bags ideal for everyday modern use.",
    ],
    image: "/our story images/Material.png",
    reverse: true,
  },
  {
    id: "design",
    tag: "Design",
    heading: "Design",
    paragraphs: [
      "Every Kibana bag is thoughtfully designed with a unique concept and meaning behind it. Our designs are inspired by real lifestyles, trends, and individuality, ensuring each piece stands out. We focus on creating bags that combine elegance, functionality, and timeless appeal, so they remain relevant beyond seasonal trends.",
    ],
    image: "/our story images/Design.png",
    reverse: false,
  },
  {
    id: "craft",
    tag: "Craftsmanship",
    heading: "How Bags Are Formed",
    paragraphs: [
      "All Kibana bags are crafted at our own manufacturing facility by a dedicated team of skilled professionals. A significant part of the process involves expert handwork, especially in detailing and finishing, which adds precision and character to every piece. This blend of careful craftsmanship and attention to detail ensures that each bag meets high standards of quality and carries a distinctive, premium feel.",
    ],
    image: "/our story images/How Bags Are Formed.jpg",
    reverse: true,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      <TrackPageView pageName="About" pageType="about" />
      {/* Hero */}
      <section className="relative h-64 overflow-hidden md:h-96 lg:h-[500px]">
        <Image
          src="/our story images/Ourstory_herosection.jpg.jpeg"
          alt="Kibana — Our Story"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-foreground/20" />
      </section>

      {/* Intro */}
      <div className="storefront-section-space container max-w-3xl text-center">
        <p className="text-sm text-muted-foreground">
          Kibana was born from a simple belief — that luxury should never come at the cost of
          ethics. Every bag we make is a statement: beautiful, purposeful, and kind to the world.
        </p>
      </div>

      {/* Story Sections */}
      <div className="storefront-section-space container max-w-[1600px] space-y-12 md:space-y-16">
        {sections.map((sec, i) => (
          <section
            key={sec.id}
            className={`flex flex-col gap-12 md:gap-16 ${
              sec.reverse ? "md:flex-row-reverse" : "md:flex-row"
            } md:items-center`}
          >
            {/* Image */}
            <div className="w-full md:w-1/2">
              <div className="relative aspect-square w-full overflow-hidden md:aspect-[4/3]">
                <Image
                  src={sec.image}
                  alt={sec.heading}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-1 flex-col gap-6">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
                  {String(i + 1).padStart(2, "0")} — {sec.tag}
                </p>
                <h2 className="section-title text-left">{sec.heading}</h2>
              </div>
              <div className="h-px w-12 bg-accent" />
              <div className="space-y-4">
                {sec.paragraphs.map((pt) => (
                  <p key={pt} className="text-sm text-muted-foreground">
                    {pt}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Values */}
      <section className="bg-accent/5">
        <div className="storefront-section-space container max-w-[1600px]">
          <div className="mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              Our Values
            </p>
            <h2 className="section-title text-left">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
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
              <div key={v.title} className="flex flex-col gap-4 border-t-2 border-accent pt-6">
                <p className="font-display text-5xl font-semibold text-accent/30">{v.num}</p>
                <h3 className="text-lg font-semibold uppercase tracking-widest">{v.title}</h3>
                <p className="text-base font-light leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center sm:px-6 md:px-8 md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
          Ready to Explore?
        </p>
        <h2 className="mb-8 font-display text-4xl font-semibold leading-tight md:text-5xl">
          Find Your Perfect Kibana
        </h2>
        <Link
          href="/shop"
          className="inline-block bg-foreground px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-background transition-all hover:bg-foreground/90"
        >
          Shop the Collection
        </Link>
      </section>
    </main>
  );
}
