"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products as staticProducts } from "@/lib/data";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";

const TREND_CARD_IMAGES: Record<string, string> = {
  p1: "/mv/Trend1.webp",
  p2: "/kibana_product_images/1 collection/Prizma Sling/Teal Blue/7.webp",
  p7: "/mv/Trend3.webp",
  p9: "/kibana_product_images/2 collection/Valera Dome/Forest Green/Image02.webp",
  p10: "/kibana_product_images/2 collection/CORDIA BAG/Lime Yellow/Image06.webp",
};

const TREND_CARD_LINKS: Record<string, string> = {
  p2: "/shop/prizma-sling-bag?color=teal-blue",
  p7: "/shop/orwyn-backpack?color=tan",
  p9: "/shop/valera-dome?color=forest-green",
  p10: "/shop/cordia-bag?color=lime-yellow",
};

export function MostTrending({ products: propProducts }: { products?: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trendingProducts = (propProducts ?? staticProducts)
    .filter((p) => p.isTrending && p.id !== "p11")
    .sort((a, b) => {
      const n = (id: string) => parseInt(id.replace(/\D/g, ""), 10) || 0;
      return n(a.id) - n(b.id);
    })
    .slice(0, 6)
    .map((p) => ({ ...p, image: TREND_CARD_IMAGES[p.id] ?? p.image }));

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
    // Scroll by 1 card at a time
    const amount = card ? card.offsetWidth + 16 : 900;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-[#f5f0e8]">
      <div className="py-2 md:container md:py-8">
        <SectionHeading title="Most Trending" className="px-4 md:px-0" />
        <div className="relative">
          {/* Scrollable carousel — 1.5 cards on mobile (peek), 2 on tablet, 3 on desktop */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex w-full gap-3 overflow-x-auto scroll-smooth pl-4 pr-6 sm:gap-4 sm:pl-0 sm:pr-4 md:gap-3 md:pl-0 md:pr-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {trendingProducts.map((p, index) => (
              <Link
                key={p.id}
                href={TREND_CARD_LINKS[p.id] ?? `/shop/${p.slug}`}
                data-card
                className="group relative h-[450px] w-[calc(85vw-1rem)] flex-shrink-0 overflow-hidden bg-[#f5f0e8] shadow-sm sm:h-[520px] sm:w-[calc(50vw-1rem)] md:h-[560px] md:w-[calc(33.333%-8px)] lg:w-[calc(33.333%-8px)]"
                style={{ scrollSnapAlign: "start" }}
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  priority={index === 0}
                  quality={70}
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-300"
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
            className="absolute left-1 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/85 p-1 text-gray-500 shadow-sm backdrop-blur transition-colors hover:text-gray-700 sm:left-2 md:left-4"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            aria-label="Next"
            className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/85 p-1 text-gray-500 shadow-sm backdrop-blur transition-colors hover:text-gray-700 sm:right-2 md:right-4"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
          </button>
        </div>
      </div>

      {/* Background fade below cards — blends into Style in Motion, never overlaps carousel */}
      <div
        aria-hidden
        className="h-8 bg-gradient-to-b from-[#f5f0e8] via-[#faf7f2] to-[#fdf8f3] sm:h-12 md:h-16"
      />
    </section>
  );
}
