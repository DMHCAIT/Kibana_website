"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products as staticProducts } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";

export function MostTrending({ products: propProducts }: { products?: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trendingProducts = (propProducts ?? staticProducts).filter((p) => p.isTrending).slice(0, 6);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
    const amount = card ? (card.offsetWidth + 12) * 2 : 600;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Most Trending" />
      <div className="relative">
        {/* Scrollable row — 2 cards visible at a time */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden scroll-smooth"
        >
          {trendingProducts.map((p) => (
            <div
              key={p.id}
              data-card
              className="flex-shrink-0 w-[calc(50%-6px)]"
            >
              <ProductCard product={p} variant="compact" />
            </div>
          ))}
        </div>

        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="absolute left-1 top-1/3 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="absolute right-1 top-1/3 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}
