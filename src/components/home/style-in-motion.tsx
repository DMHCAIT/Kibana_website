"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { Leaf, Zap, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
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
  { icon: Leaf, label: "Eco-Friendly" },
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

      {/* Trust Badges — Premium Luxury Section */}
      <div className="mt-10 grid grid-cols-3 gap-5 rounded-3xl border-2 border-kibana-tan/30 bg-gradient-to-br from-kibana-tan/15 via-kibana-cream/40 to-kibana-camel/20 px-5 py-8 text-center shadow-2xl backdrop-blur-sm sm:mt-14 sm:gap-10 sm:px-10 sm:py-12">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.label} className="group flex flex-col items-center gap-4 sm:gap-5">
              <div className="relative">
                {/* Luxury glow effect behind circle */}
                <div className="absolute inset-0 scale-110 rounded-full bg-kibana-tan/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
                {/* Premium circular badge with border */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-kibana-tan/30 bg-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_20px_40px_rgba(201,167,123,0.3)] sm:h-20 sm:w-20">
                  <Icon className="h-7 w-7 text-kibana-tan transition-transform duration-300 group-hover:scale-125 sm:h-10 sm:w-10" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold uppercase leading-tight tracking-[0.2em] text-kibana-ink sm:text-base">
                  {badge.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
