"use client";

import Image from "next/image";
import { SectionHeading } from "./section-heading";
import { Leaf, Zap, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

const tiles = [
  { src: "/extracted/img-030.jpg", alt: "Beauto styling", label: "BEAUTO", video: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { src: "/extracted/img-040.jpg", alt: "Fabulous styling", label: "FABULOUS", video: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { src: "/extracted/img-050.jpg", alt: "Luxury styling", label: "Luxury", video: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { src: "/extracted/img-100.jpg", alt: "Elegant styling", label: "ELEGANT", video: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { src: "/extracted/img-110.jpg", alt: "Classic styling", label: "CLASSIC", video: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
];

const badges = [
  { icon: Leaf, label: "Eco-Friendly" },
  { icon: Zap, label: "Vegan Leather" },
  { icon: RotateCcw, label: "Easy Returns" },
];

export function StyleInMotion() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
            {tiles.map((t) => (
              <button
                key={t.label}
                onClick={() => setPlayingVideo(playingVideo === t.label ? null : t.label)}
                className="relative flex-shrink-0 w-36 sm:w-44 md:w-52 lg:w-56 aspect-[1/2.2] overflow-hidden bg-kibana-cream group cursor-pointer"
              >
                {playingVideo === t.label ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={t.video}
                    title={t.label}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <Image src={t.src} alt={t.alt} fill sizes="180px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold text-xs sm:text-sm uppercase tracking-[0.1em]">{t.label}</span>
                    </div>
                  </>
                )}
              </button>
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
    </section>
  );
}
