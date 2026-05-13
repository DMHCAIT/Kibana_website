"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "./section-heading";

const editorial = [
  {
    image:
      "https://placehold.co/800x900/EFEAE3/1A1A1A?text=Soft+Power&font=playfair",
    label: "Soft Power",
    href: "/shop?cat=tote-bag",
  },
  {
    image:
      "https://placehold.co/800x900/8B2A2A/FFFFFF?text=Bold+Carry&font=playfair",
    label: "Bold Carry",
    href: "/shop?cat=sling-bag",
  },
  {
    image:
      "https://placehold.co/800x900/D4AF37/1A1A1A?text=Gold+Standard&font=playfair",
    label: "Gold Standard",
    href: "/shop?cat=wallet",
  },
];

export function MostTrending() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((current + 1) % editorial.length);
  };

  const prev = () => {
    setCurrent((current - 1 + editorial.length) % editorial.length);
  };

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Most Trending" />
      <div className="relative">
        <div className="flex items-stretch gap-2 sm:gap-3">
          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="flex-shrink-0 flex items-center justify-center w-8 sm:w-9 hover:bg-accent/20 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1">
            {editorial.slice(current, current + 2).map((e) => (
              <Link
                key={e.label}
                href={e.href}
                className="group relative block overflow-hidden bg-kibana-cream aspect-[3/3.5] sm:aspect-[4/5] md:aspect-[5/6]"
              >
                <Image
                  src={e.image}
                  alt={e.label}
                  fill
                  sizes="(max-width: 768px) 45vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                  <span className="text-white text-sm sm:text-lg font-semibold tracking-[0.15em] uppercase">
                    {e.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next"
            className="flex-shrink-0 flex items-center justify-center w-8 sm:w-9 hover:bg-accent/20 transition-colors"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {editorial.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-6 bg-foreground" : "w-2 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
