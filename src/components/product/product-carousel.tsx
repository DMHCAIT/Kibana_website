"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";
import type { Product } from "@/types/product";

type ProductGridItem = {
  key: string;
  product: Product;
  href?: string;
  displayName?: string;
  displayImage?: string;
  variantInStock?: boolean; // New: indicates if color variant is in stock
};

type Props = {
  items: ProductGridItem[];
};

export function ProductCarousel({ items }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    // Check scroll on mount and when items change
    checkScroll();

    // Also check after a short delay to account for image loading
    const timer = setTimeout(checkScroll, 500);

    return () => clearTimeout(timer);
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="relative">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="scrollbar-hide overflow-x-auto"
        style={{
          scrollBehavior: "smooth",
          display: "flex",
          gap: "1rem",
          paddingBottom: "0.5rem",
        }}
      >
        {items.map((item, index) => (
          <div key={item.key} className="w-[165px] shrink-0 sm:w-[220px] md:w-[250px]">
            <ProductCard
              product={item.product}
              href={item.href}
              displayName={item.displayName}
              displayImage={item.displayImage}
              variantInStock={item.variantInStock}
              variant="compact"
              priority={index < 4}
            />
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 -translate-x-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white sm:-translate-x-6"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white sm:translate-x-6"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

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
  );
}
