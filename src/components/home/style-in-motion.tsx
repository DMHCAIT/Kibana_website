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
      className="relative flex-shrink-0 w-[calc(50%-6px)] lg:w-[calc(20%-10px)] aspect-[1/1.7] overflow-hidden bg-kibana-cream group cursor-pointer block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Always-visible product image */}
      <Image
        src={tile.src}
        alt={tile.alt}
        fill
        sizes="180px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
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
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-2 px-2">
        <span className="text-white font-semibold text-xs sm:text-sm uppercase tracking-[0.1em] block text-center">{tile.label}</span>
      </div>
    </Link>
  );
}

export function StyleInMotion({ products = [] }: { products?: Product[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollBy({ left: direction === "left" ? -width : width, behavior: "smooth" });
  };

  // Use admin-assigned products as tiles if available; otherwise fall back to defaults
  const tiles: Tile[] = products.length > 0
    ? products.map((p) => ({ src: p.image, alt: p.name, label: p.name, href: `/shop/${p.slug}`, video: p.video }))
    : FALLBACK_TILES;

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Style in Motion" />
      <div className="relative">
        {/* Carousel — clips overflow so no partial cards bleed out */}
        <div className="overflow-hidden">
          <div ref={scrollContainerRef} className="flex overflow-x-auto pb-2 gap-3 sm:gap-4 md:gap-6 mb-8 scrollbar-hide">
            {tiles.map((t, i) => (
              <TileCard key={`${t.label}-${i}`} tile={t} />
            ))}
          </div>
        </div>

        {/* Left Arrow — inside the left fade zone */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-[calc(50%-1rem)] -translate-y-1/2 z-10 text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Right Arrow — inside the right fade zone */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-[calc(50%-1rem)] -translate-y-1/2 z-10 text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center py-2">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-foreground/70" />
              </div>
              <p className="text-xs font-medium text-foreground/70 uppercase tracking-[0.1em]">
                {badge.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
