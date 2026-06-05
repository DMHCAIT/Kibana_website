"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products as staticProducts } from "@/lib/data";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";

const TREND_IMAGES: Record<string, string> = {
  p1:  "/mv/Trend1.png",
  p2:  "/mv/Trend2.png",
  p7:  "/mv/Trend3.png",
  p9:  "/mv/Trend4.png",
  p10: "/mv/Trend5.png",
  p11: "/mv/Trend6.png",
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
    <section className="bg-[#eef4f0] w-full py-2 md:py-8">
    <div className="md:container">
      <SectionHeading title="Most Trending" className="px-4 md:px-0" />
      <div className="relative overflow-hidden">
        {/* Scrollable carousel — 1.5 cards on mobile (peek), 2 on tablet, 3 on desktop */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-2 overflow-x-auto scroll-smooth scrollbar-hide pl-4 sm:pl-0 pr-6 sm:pr-4 md:pl-0 md:pr-0 md:overflow-hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {trendingProducts.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              data-card
              className="flex-shrink-0 w-[calc(80vw-1rem)] sm:w-[calc(50vw-1rem)] md:w-[320px] lg:w-[calc(33.333%-8px)] h-[340px] sm:h-[400px] md:h-[480px] relative overflow-hidden rounded-xl group shadow-md sm:shadow-lg"
              style={{ scrollSnapAlign: "start" }}
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="428px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay at bottom with product name */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent pt-16 pb-5 px-3 sm:px-4">
                <p className="text-white text-xs sm:text-base md:text-lg font-semibold uppercase tracking-widest text-center line-clamp-2 leading-tight">
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
          className="hidden sm:flex absolute left-4 top-1/3 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="hidden sm:flex absolute right-4 top-1/3 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
    </section>
  );
}
