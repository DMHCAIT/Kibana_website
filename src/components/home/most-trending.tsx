"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products as staticProducts } from "@/lib/data";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";

const TREND_IMAGES: Record<string, string> = {
  p1: "/mv/Trend1.webp",
  p2: "/mv/Trend2.webp",
  p7: "/mv/Trend3.webp",
  p9: "/mv/Trend4.webp",
  p10: "/mv/Trend5.webp",
  p11: "/mv/Trend6.webp",
};

export function MostTrending({ products: propProducts }: { products?: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trendingProducts = (propProducts ?? staticProducts)
    .filter((p) => p.isTrending)
    .sort((a, b) => {
      const n = (id: string) => parseInt(id.replace(/\D/g, ""), 10) || 0;
      return n(a.id) - n(b.id);
    })
    .slice(0, 6)
    .map((p) => ({ ...p, image: TREND_IMAGES[p.id] ?? p.image }));

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
    // Scroll by 1 card at a time
    const amount = card ? card.offsetWidth + 16 : 900;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-[#eef4f0] py-2 md:py-8">
      <div className="md:container">
        <SectionHeading title="Most Trending" className="px-4 md:px-0" />
        <div className="relative">
          {/* Scrollable carousel — 1.5 cards on mobile (peek), 2 on tablet, 3 on desktop */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex w-full gap-3 overflow-x-auto scroll-smooth pl-4 pr-6 sm:gap-4 sm:pl-0 sm:pr-4 md:gap-3 md:pl-0 md:pr-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {trendingProducts.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                data-card
                className="group relative h-[450px] w-[calc(85vw-1rem)] flex-shrink-0 overflow-hidden rounded-xl shadow-sm sm:h-[520px] sm:w-[calc(50vw-1rem)] md:h-[560px] md:w-[calc(33.333%-8px)] lg:w-[calc(33.333%-8px)]"
                style={{ scrollSnapAlign: "start" }}
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay at bottom with product name */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pb-4 pt-12 sm:px-4">
                  <p className="line-clamp-2 text-center text-xs font-semibold uppercase leading-snug tracking-[0.15em] text-white sm:text-sm">
                    {p.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            aria-label="Previous"
            className="absolute left-4 top-1/3 z-10 hidden -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 sm:flex"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="absolute right-4 top-1/3 z-10 hidden -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 sm:flex"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      </div>
    </section>
  );
}
