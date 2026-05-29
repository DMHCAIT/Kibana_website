"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products as staticProducts } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
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
    const amount = card ? (card.offsetWidth + 8) * 2 : 600;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-[#eef4f0] w-full py-2 md:py-8">
    <div className="md:container">
      <SectionHeading title="Most Trending" className="px-4 md:px-0" />
      <div className="relative">
        {/* Scrollable row — 2 cards visible at a time */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto sm:overflow-x-hidden scroll-smooth scrollbar-hide"
        >
          {trendingProducts.map((p) => (
            <div
              key={p.id}
              data-card
              className="flex-shrink-0 w-[75%] sm:w-[calc(50%-4px)]"
            >
              <ProductCard product={p} variant="compact" imageClassName="aspect-[3/4] sm:aspect-[1/1]" />
            </div>
          ))}
        </div>

        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="hidden sm:flex absolute left-0 top-1/3 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="hidden sm:flex absolute right-0 top-1/3 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
    </section>
  );
}
