"use client";

import { useRef } from "react";
import Image from "@/components/ui/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pickDefaultProductImage } from "@/lib/product-images";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";
import { homepageVariants, productHref } from "@/lib/product-presentation";

export function MostTrending({ products = [] }: { products?: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const trendingProducts = homepageVariants(products, "isTrending");

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
    const amount = card ? card.offsetWidth + 24 : 600;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const arrow =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/25 text-foreground transition-colors duration-300 hover:border-kibana-brown hover:bg-kibana-brown hover:text-white";

  return (
    <section className="w-full">
      <div className="container py-10 sm:py-12 md:py-16">
        <div className="relative">
          <SectionHeading title="Most Trending" subtitle="What everyone is obsessing over" />
          {trendingProducts.length > 0 && (
            <div className="absolute right-0 top-1 hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous"
                className={arrow}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.4} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next"
                className={arrow}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.4} />
              </button>
            </div>
          )}
        </div>

        {trendingProducts.length > 0 ? (
          <div
            ref={scrollRef}
            className="scrollbar-hide -mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-3 sm:mx-0 sm:gap-6 sm:px-0"
          >
            {trendingProducts.map(({ product: p, variant }, index) => (
              <Link
                key={`${p.id}-${variant.slug}`}
                href={productHref(p, variant)}
                data-card
                className="group w-[72vw] flex-shrink-0 snap-start sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-kibana-tile">
                  <Image
                    src={pickDefaultProductImage(variant.image, variant.gallery)}
                    alt={variant.productTitle || `${p.name} - ${variant.color}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 72vw, (max-width: 1024px) 33vw, 25vw"
                    className="duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] object-cover transition-transform group-hover:scale-[1.07]"
                  />
                </div>
                <p className="product-title mt-4 line-clamp-2 text-center">
                  {variant.productTitle || `${p.name} - ${variant.color}`}
                </p>
                <p className="mt-1.5 text-center">
                  <span className="link-draw text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
                    Explore
                  </span>
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No trending products available at the moment.
          </p>
        )}

        {trendingProducts.length > 0 && (
          <div className="mt-6 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous"
              className={arrow}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.4} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next"
              className={arrow}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.4} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
