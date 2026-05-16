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
    const amount = card ? card.offsetWidth + 12 : 280;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Most Trending" />
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-border shadow-sm p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Scrollable card row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1"
        >
          {trendingProducts.map((p) => (
            <div
              key={p.id}
              data-card
              className="flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(33.333%-8px)]"
            >
              <ProductCard product={p} variant="compact" />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-border shadow-sm p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
