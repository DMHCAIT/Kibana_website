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
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    observer.observe(container);
    return () => observer.disconnect();
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const card = container.firstElementChild;
    if (!card) return;
    const scrollAmount =
      card.getBoundingClientRect().width + parseFloat(getComputedStyle(container).columnGap);
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="group/carousel relative">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-6 lg:gap-12"
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            className="w-[72%] shrink-0 snap-start sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-144px)/4)]"
          >
            <ProductCard
              product={item.product}
              href={item.href}
              displayName={item.displayName}
              displayImage={item.displayImage}
              variantInStock={item.variantInStock}
              variantKey={item.key}
              variant="compact"
              priority={index < 4}
            />
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="pointer-events-none absolute left-3 top-[42%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white opacity-0 shadow-md transition-opacity duration-300 focus-visible:pointer-events-auto focus-visible:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:opacity-100 group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100 md:pointer-events-auto md:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="pointer-events-none absolute right-3 top-[42%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white opacity-0 shadow-md transition-opacity duration-300 focus-visible:pointer-events-auto focus-visible:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:opacity-100 group-hover/carousel:pointer-events-auto group-hover/carousel:opacity-100 md:pointer-events-auto md:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
