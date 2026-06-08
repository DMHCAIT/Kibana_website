"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { Leaf, Zap, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import type { Product } from "@/types/product";

const FALLBACK_TILES: { src: string; alt: string; label: string; href: string; video?: string }[] = [
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
      className="relative flex-shrink-0 w-[230px] h-[420px] overflow-hidden rounded-xl bg-kibana-cream group cursor-pointer block shadow-lg hover:shadow-2xl transition-all duration-300"
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {/* Bottom label */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent pt-12 pb-3 px-3">
        <span className="text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] block text-center line-clamp-2">{tile.label}</span>
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
    scrollContainerRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  // Use admin-assigned products as tiles if available; otherwise fall back to defaults
  const tiles: Tile[] = products.length > 0
    ? products.map((p) => ({ src: p.image, alt: p.name, label: p.name, href: `/shop/${p.slug}`, video: p.video }))
    : FALLBACK_TILES;

  return (
    <section className="container py-6 md:py-12">
      <SectionHeading title="Style in Motion" />
      <div className="relative space-y-6 sm:space-y-8">
        {/* Left Arrow — hidden on mobile, visible on sm+, hidden on lg (6 cards fit without scrolling) */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:block lg:hidden absolute left-2 top-[40%] -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-7 w-7 text-kibana-tan hover:text-kibana-camel drop-shadow-lg" />
        </button>

        {/* Right Arrow — hidden on mobile, visible on sm+, hidden on lg (6 cards fit without scrolling) */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:block lg:hidden absolute right-2 top-[40%] -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-7 w-7 text-kibana-tan hover:text-kibana-camel drop-shadow-lg" />
        </button>

        {/* Carousel */}
        <div ref={scrollContainerRef} className="flex overflow-x-auto lg:overflow-hidden pb-2 gap-4 mb-2 sm:mb-0 scrollbar-hide">
          {tiles.map((t, i) => (
            <TileCard key={`${t.label}-${i}`} tile={t} />
          ))}
        </div>
      </div>

      {/* Trust Badges — Premium Luxury Section */}
      <div className="grid grid-cols-3 gap-5 sm:gap-10 text-center py-8 sm:py-12 px-5 sm:px-10 bg-gradient-to-br from-kibana-tan/15 via-kibana-cream/40 to-kibana-camel/20 rounded-3xl border-2 border-kibana-tan/30 shadow-2xl mt-10 sm:mt-14 backdrop-blur-sm">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.label} className="flex flex-col items-center gap-4 sm:gap-5 group">
              <div className="relative">
                {/* Luxury glow effect behind circle */}
                <div className="absolute inset-0 bg-kibana-tan/20 rounded-full blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Premium circular badge with border */}
                <div className="w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center bg-white rounded-full shadow-2xl border-2 border-kibana-tan/30 transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(201,167,123,0.3)] group-hover:scale-110">
                  <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-kibana-tan transition-transform duration-300 group-hover:scale-125" />
                </div>
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-kibana-ink uppercase tracking-[0.2em] leading-tight">
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
