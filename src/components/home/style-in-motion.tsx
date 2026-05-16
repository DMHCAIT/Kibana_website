"use client";

import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { Leaf, Zap, RotateCcw, ChevronLeft, ChevronRight, Play, X, ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
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

export function StyleInMotion({ products = [] }: { products?: Product[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<Tile | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  // Use admin-assigned products as tiles if available; otherwise fall back to defaults
  const tiles: Tile[] = products.length > 0
    ? products.map((p) => ({ src: p.image, alt: p.name, label: p.name, href: `/shop/${p.slug}`, video: p.video }))
    : FALLBACK_TILES;

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Style in Motion" />
      <div className="relative flex items-center gap-4">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 bg-kibana-cream text-kibana-ink p-2 rounded-full hover:bg-kibana-stone transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Carousel */}
        <div className="overflow-hidden flex-1 mx-10">
          <div ref={scrollContainerRef} className="flex overflow-x-auto pb-2 gap-3 sm:gap-4 md:gap-6 mb-8 scrollbar-hide">
            {tiles.map((t, i) => (
              <div
                key={`${t.label}-${i}`}
                className="relative flex-shrink-0 w-36 sm:w-44 md:w-52 lg:w-56 aspect-[1/2.2] overflow-hidden bg-kibana-cream group cursor-pointer"
                onClick={() => t.video ? setModal(t) : undefined}
              >
                {/* Image or muted looping video preview */}
                {t.video ? (
                  <video
                    src={t.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Link href={t.href} className="absolute inset-0">
                    <Image src={t.src} alt={t.alt} fill sizes="180px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t.video && (
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                    </div>
                  )}
                  <span className="text-white font-semibold text-xs sm:text-sm uppercase tracking-[0.1em] px-2 text-center">{t.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 bg-kibana-cream text-kibana-ink p-2 rounded-full hover:bg-kibana-stone transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
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

      {/* Video Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="relative w-full max-w-sm bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setModal(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Video */}
            <video
              src={modal.video}
              autoPlay
              controls
              playsInline
              className="w-full aspect-[9/16] object-cover"
            />

            {/* Product CTA */}
            <div className="p-4 bg-kibana-ink">
              <p className="text-kibana-cream text-sm font-semibold mb-3 truncate">{modal.label}</p>
              <Link
                href={modal.href}
                onClick={() => setModal(null)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-kibana-tan text-kibana-ink text-sm font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="h-4 w-4" />
                View Product
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
