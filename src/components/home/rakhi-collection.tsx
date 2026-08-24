"use client";

import Image from "next/image";

type CollectionCard = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  iconType: "tote" | "sling" | "clutch";
};

const CARDS: CollectionCard[] = [
  {
    id: "office-girlie",
    title: "OFFICE GIRLIE",
    subtitle: "Tote Bags & Laptop Bags",
    image: "/rakhi/new1.jpeg",
    href: "/shop?cat=tote-bag,laptop-bag",
    iconType: "tote",
  },
  {
    id: "sophisticated-girlie",
    title: "SOPHISTICATED GIRLIE",
    subtitle: "Sling Bags",
    image: "/rakhi/new2.jpeg",
    href: "/shop?cat=sling-bag",
    iconType: "sling",
  },
  {
    id: "minimal-girlie",
    title: "MINIMAL GIRLIE",
    subtitle: "Clutches",
    image: "/rakhi/new3.jpeg",
    href: "/shop?cat=clutch",
    iconType: "clutch",
  },
];

function BagIcon({ type }: { type: CollectionCard["iconType"] }) {
  if (type === "tote") {
    return (
      /* Tote Icon */
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        className="h-6 w-6 text-[#A67C52]"
      >
        {/* Handle Arc */}
        <path d="M8.5 9.5V6.8a3.3 3.3 0 0 1 7 0v2.7" strokeLinecap="round" />
        {/* Tote Bag Body */}
        <rect x="4.5" y="9.5" width="15" height="11.5" rx="2.2" strokeLinejoin="round" />
        {/* Left Vertical Seam */}
        <line x1="8.2" y1="9.5" x2="8.2" y2="21" strokeLinecap="round" />
        {/* Right Charm Tag */}
        <path d="M16 10.5v3" strokeLinecap="round" />
        <circle cx="16" cy="14.2" r="0.7" fill="currentColor" />
      </svg>
    );
  }

  if (type === "sling") {
    return (
      /* Sling Bag Icon */
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        className="h-6 w-6 text-[#A67C52]"
      >
        {/* Tall Strap */}
        <path d="M9 10V5.2a3 3 0 0 1 6 0V10" strokeLinecap="round" />
        {/* Main Body */}
        <path
          d="M6 10.5h12a1 1 0 0 1 1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 19v-7.5a1 1 0 0 1 1-1z"
          strokeLinejoin="round"
        />
        {/* Top Rim Line */}
        <line x1="5.5" y1="12.2" x2="18.5" y2="12.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    /* Envelope Clutch Icon */
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      className="h-6 w-6 text-[#A67C52]"
    >
      {/* Top Tab */}
      <rect x="10.8" y="3.5" width="2.4" height="2" rx="0.6" strokeLinejoin="round" />
      {/* Main Body Envelope */}
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" strokeLinejoin="round" />
      {/* Flap Curve */}
      <path d="M3.5 9.8C6.5 13 9.5 14.8 12 14.8s5.5-1.8 8.5-5" strokeLinecap="round" />
      {/* Center Lock Clasp */}
      <rect x="10.6" y="13.5" width="2.8" height="2" rx="0.5" strokeLinejoin="round" />
    </svg>
  );
}

export function RakhiCollection() {
  return (
    <section className="w-full bg-[#FAF7F2] py-8 sm:py-12 md:py-14">
      <div className="container max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <span className="mb-1 block text-[16px] font-semibold uppercase tracking-[0.25em] text-[#A67C52] sm:mb-2 sm:text-xl">
            RAKHI COLLECTION
          </span>
          <h2 className="mb-2 text-2xl font-medium tracking-tight text-[#1A1A1A] sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl">
            Celebrate Love, Celebrate Style
          </h2>
          <p className="text-xs font-normal text-stone-600 sm:text-sm">
            Thoughtful gifts for the bond that lasts forever.
          </p>
        </div>

        {/* Cards Carousel on Mobile / 3-Column Grid on Desktop */}
        <div className="scrollbar-hide flex w-full gap-4 overflow-x-auto pb-4 pt-1 sm:gap-5 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 md:pt-0">
          {CARDS.map((card) => (
            <a
              key={card.id}
              href={card.href}
              className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#EFE8DE] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:w-[320px] md:w-full"
            >
              {/* Top Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Floating Seam Circle Icon Badge */}
              <div className="relative z-10 mx-auto -mt-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#EFE8DE] shadow-sm transition-transform group-hover:scale-110 sm:-mt-7 sm:h-14 sm:w-14">
                <BagIcon type={card.iconType} />
              </div>

              {/* Card Content Area */}
              <div className="flex flex-1 flex-col items-center justify-between bg-white p-5 pt-3 text-center sm:p-6 sm:pt-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A] transition-colors group-hover:text-[#A67C52] sm:text-sm">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs font-light text-stone-500 sm:text-sm">
                    {card.subtitle}
                  </p>
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A67C52] transition-colors group-hover:text-[#1A1A1A] sm:mt-5 sm:text-xs">
                  <span>EXPLORE COLLECTION</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
}
