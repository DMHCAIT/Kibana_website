"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { products } from "@/lib/data";
import { SectionHeading } from "./section-heading";

const trendingProducts = products.filter((p) => p.isTrending);

export function MostTrending() {
  const [current, setCurrent] = useState(0);
  const total = trendingProducts.length;

  const next = () => setCurrent((prev) => (prev + 2) % total);
  const prev = () => setCurrent((prev) => (prev - 2 + total) % total);

  const visible = [
    trendingProducts[current % total],
    trendingProducts[(current + 1) % total],
  ];

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Most Trending" />
      <div className="relative">
        {/* Prev arrow — inside left edge */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 text-white drop-shadow-md hover:scale-110 transition-transform"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {visible.map((p) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="group relative block overflow-hidden bg-kibana-cream aspect-[3/5] sm:aspect-[4/5]"
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 50vw, 45vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>

        {/* Next arrow — inside right edge */}
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 text-white drop-shadow-md hover:scale-110 transition-transform"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>
    </section>
  );
}
