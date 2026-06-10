"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { Truck, Zap, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import type { Product } from "@/types/product";

const FALLBACK_TILES: { src: string; alt: string; label: string; href: string; video?: string }[] =
  [
    { src: "/extracted/img-030.jpg", alt: "Beauto styling", label: "BEAUTO", href: "/shop" },
    { src: "/extracted/img-040.jpg", alt: "Fabulous styling", label: "FABULOUS", href: "/shop" },
    { src: "/extracted/img-050.jpg", alt: "Luxury styling", label: "Luxury", href: "/shop" },
    { src: "/extracted/img-100.jpg", alt: "Elegant styling", label: "ELEGANT", href: "/shop" },
    { src: "/extracted/img-110.jpg", alt: "Classic styling", label: "CLASSIC", href: "/shop" },
  ];

const badges = [
  { icon: Truck, label: "Delivery in 4 days" },
  { icon: Zap, label: "Vegan Leather" },
  { icon: RotateCcw, label: "Easy Returns" },
];

type Tile = { src: string; alt: string; label: string; href: string; video?: string };

/** Individual card: shows image, plays video (with sound) on hover once, navigates on click */
function TileCard({ tile }: { tile: Tile }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!tile.video) return;
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [tile.video]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleEnded = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <Link
      href={tile.href}
      data-card
      className="group relative block h-[330px] w-[180px] flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl bg-kibana-cream shadow-lg transition-all duration-300 hover:shadow-2xl sm:h-[420px] sm:w-[230px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Always-visible product image */}
      <Image
        src={tile.src}
        alt={tile.alt}
        fill
        sizes="230px"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Video overlay — shown on hover, plays once with sound, no controls */}
      {tile.video && (
        <video
          ref={videoRef}
          src={tile.video}
          playsInline
          onEnded={handleEnded}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {/* Bottom label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pb-3 pt-12">
        <span className="line-clamp-2 block text-center text-xs font-semibold uppercase tracking-[0.15em] text-white sm:text-sm">
          {tile.label}
        </span>
      </div>
    </Link>
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

  // Use admin-assigned products as tiles if available; otherwise fall back to defaults
  const tiles: Tile[] =
    products.length > 0
      ? products.map((p) => ({
          src: p.image,
          alt: p.name,
          label: p.name,
          href: `/shop/${p.slug}`,
          video: p.video,
        }))
      : FALLBACK_TILES;

  return (
    <section className="container py-6 md:py-12">
      <SectionHeading title="Style in Motion" />
      <div className="relative space-y-6 sm:space-y-8">
        {/* Left Arrow — hidden on mobile, visible on sm+, hidden on lg (6 cards fit without scrolling) */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-[40%] z-10 hidden -translate-y-1/2 transition-all duration-300 hover:scale-110 sm:block lg:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-7 w-7 text-kibana-tan drop-shadow-lg hover:text-kibana-camel" />
        </button>

        {/* Right Arrow — hidden on mobile, visible on sm+, hidden on lg (6 cards fit without scrolling) */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-[40%] z-10 hidden -translate-y-1/2 transition-all duration-300 hover:scale-110 sm:block lg:hidden"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-7 w-7 text-kibana-tan drop-shadow-lg hover:text-kibana-camel" />
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
      <div className="mt-8 rounded-2xl border border-kibana-tan/25 bg-gradient-to-br from-kibana-tan/10 via-kibana-cream/40 to-kibana-camel/10 px-2 py-5 sm:mt-12 sm:px-8 sm:py-8">
        <div className="grid grid-cols-3 gap-2 text-center sm:gap-8">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="group flex flex-col items-center gap-2 sm:gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-kibana-tan/30 bg-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16">
                  <Icon className="h-5 w-5 text-kibana-tan sm:h-7 sm:w-7" />
                </div>
                <p className="whitespace-normal text-[9px] font-semibold uppercase leading-snug tracking-[0.08em] text-kibana-ink sm:whitespace-nowrap sm:text-sm sm:tracking-[0.18em]">
                  {badge.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
