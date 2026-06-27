"use client";

import { SectionHeading } from "./section-heading";
import { Truck, Zap, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { Product } from "@/types/product";

const DEFAULT_VIDEO_POOL = [
  "/videos/compressed/IMG_3139.mp4",
  "/videos/compressed/Guneet_Kaur_Draft.mp4",
  "/videos/compressed/IMG_0765.mp4",
  "/videos/compressed/IMG_2924.mp4",

  "/videos/compressed/IMG_3237.mp4",
  "/videos/compressed/IMG_3547.mp4",
  "/videos/compressed/IMG_4378.mp4",
  "/videos/compressed/IMG_4481.mp4",
  "/videos/compressed/IMG_4484.mp4",
  "/videos/compressed/IMG_4513.mp4",
  "/videos/compressed/IMG_5514.mp4",
  "/videos/compressed/IMG_5878.mp4",
  "/videos/compressed/01_KIBANA_BAG_4K_F.mp4",
  "/videos/compressed/Sony_Kibana_Compressed.mp4",
  "/videos/compressed/IMG_8582.mp4",
];

const FALLBACK_TILES: { alt: string; label: string; href: string; video?: string }[] = [
  {
    alt: "Kibana style in motion 4",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/Guneet_Kaur_Draft.mp4",
  },
  {
    alt: "Kibana style in motion 5",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_0765.mp4",
  },
  {
    alt: "Kibana style in motion 6",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_2924.mp4",
  },
  {
    alt: "Kibana style in motion 7",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_3139.mp4",
  },
  {
    alt: "Kibana style in motion 8",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_3237.mp4",
  },
  {
    alt: "Kibana style in motion 9",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_3547.mp4",
  },
  {
    alt: "Kibana style in motion 10",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_4378.mp4",
  },
  {
    alt: "Kibana style in motion 11",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_4481.mp4",
  },
  {
    alt: "Kibana style in motion 12",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_4484.mp4",
  },
  {
    alt: "Kibana style in motion 13",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_4513.mp4",
  },
  {
    alt: "Kibana style in motion 14",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_5514.mp4",
  },
  {
    alt: "Kibana style in motion 15",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_5878.mp4",
  },
  {
    alt: "Kibana style in motion 1",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/01_KIBANA_BAG_4K_F.mp4",
  },
  {
    alt: "Kibana style in motion 2",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/Sony_Kibana_Compressed.mp4",
  },
  {
    alt: "Kibana style in motion 3",
    label: "KIBANA",
    href: "/shop",
    video: "/videos/compressed/IMG_8582.mp4",
  },
];

const badges = [
  { icon: Truck, label: "Delivery in 4 days" },
  { icon: Zap, label: "Premium Quality" },
  { icon: RotateCcw, label: "Easy Returns" },
];

type Tile = { alt: string; label: string; href: string; video?: string };

/** Individual card: autoplays while visible and keeps original tile size/layout */
function TileCard({ tile }: { tile: Tile }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!tile.video || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
    };
  }, [tile.video]);

  useEffect(() => {
    if (!tile.video || !videoRef.current) return;

    if (isInView) {
      videoRef.current.play().catch(() => {});
      return;
    }

    videoRef.current.pause();
  }, [isInView, tile.video]);

  return (
    <div
      ref={cardRef}
      data-card
      className="group relative block h-[330px] w-[180px] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-kibana-cream shadow-lg transition-all duration-300 hover:shadow-2xl sm:h-[420px] sm:w-[230px]"
    >
      {tile.video && (
        <video
          ref={videoRef}
          src={tile.video}
          muted
          autoPlay
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
      {!tile.video && <div className="absolute inset-0 bg-black/70" />}

      {/* Bottom label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pb-3 pt-12">
        <span className="line-clamp-2 block text-center text-xs font-semibold uppercase tracking-[0.15em] text-white sm:text-sm">
          {tile.label}
        </span>
      </div>
    </div>
  );
}

export function StyleInMotion({ products = [] }: { products?: Product[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const card = scrollContainerRef.current.querySelector("[data-card]") as HTMLElement | null;
    const amount = card ? (card.offsetWidth + 16) * 5 : 1200; // 5 cards + gaps
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const tiles: Tile[] =
    products.length > 0
      ? products.map((p, index) => ({
          alt: p.name,
          label: p.name,
          href: `/shop/${p.slug}`,
          video: p.video || DEFAULT_VIDEO_POOL[index % DEFAULT_VIDEO_POOL.length],
        }))
      : FALLBACK_TILES;

  return (
    <section className="container py-6 md:py-12">
      <SectionHeading title="Style in Motion" />
      <div className="relative space-y-6 sm:space-y-8">
        {/* Left Arrow — hidden on mobile, visible on sm+, hidden on lg (6 cards fit without scrolling) */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/85 p-1 shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 sm:left-2 lg:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-kibana-tan drop-shadow-lg hover:text-kibana-camel sm:h-7 sm:w-7" />
        </button>

        {/* Right Arrow — hidden on mobile, visible on sm+, hidden on lg (6 cards fit without scrolling) */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/85 p-1 shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 sm:right-2 lg:hidden"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-kibana-tan drop-shadow-lg hover:text-kibana-camel sm:h-7 sm:w-7" />
        </button>

        {/* Carousel */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-hide mb-2 flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 sm:mb-0 lg:overflow-hidden"
        >
          {tiles.map((t, i) => (
            <TileCard key={`${t.label}-${i}`} tile={t} />
          ))}
        </div>
      </div>

      {/* Trust Badges — USP strip */}
      <div className="relative mt-8 sm:mt-12">
        <div className="relative rounded-2xl border border-kibana-tan/35 bg-gradient-to-br from-kibana-tan/20 via-kibana-cream/55 to-kibana-camel/20 px-2 py-5 shadow-[0_8px_20px_rgba(26,26,26,0.12),0_0_0_1px_rgba(185,142,90,0.18)] sm:px-8 sm:py-8">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-black sm:mb-5 sm:text-sm">
            Why Kibana
          </p>
          <div className="grid grid-cols-3 gap-2 text-center sm:gap-6">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="group flex min-h-[94px] flex-col items-center justify-center gap-2 rounded-xl border border-kibana-tan/40 bg-white/80 px-1 py-2 shadow-[0_4px_10px_rgba(26,26,26,0.1),0_0_0_1px_rgba(185,142,90,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(26,26,26,0.14),0_0_0_1px_rgba(185,142,90,0.22)] sm:min-h-[132px] sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-kibana-tan/40 bg-white shadow-[0_4px_10px_rgba(185,142,90,0.18)] sm:h-14 sm:w-14">
                    <Icon className="h-5 w-5 text-kibana-camel sm:h-7 sm:w-7" />
                  </div>
                  <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.08em] text-kibana-ink sm:whitespace-nowrap sm:text-[13px] sm:tracking-[0.16em]">
                    {badge.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
