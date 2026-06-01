"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Hero banner images — mobile and desktop versions per slide
const heroSlides = [
  {
    mobile:  "/mv/hero1.jpg.jpeg",
    desktop: "/mv/women-hero-desktop.jpg.jpeg",
    alt:     "Women collection",
  },
  {
    mobile:  "/mv/hero2.jpg.jpeg",
    desktop: "/mv/men-hero-desktop.jpg.jpeg",
    alt:     "Men collection",
  },
];

export function HeroBanner() {
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  const FADE_MS = 600;
  const INTERVAL_MS = 4000;

  const goTo = (index: number) => {
    if (index === currentImage || fading) return;
    setPrevImage(currentImage);
    setFading(true);
    setCurrentImage(index);
    setTimeout(() => {
      setPrevImage(null);
      setFading(false);
    }, FADE_MS);
  };

  // Auto-advance every 4s
  useEffect(() => {
    if (fading) return;
    const timer = setInterval(() => {
      const next = (currentImage + 1) % heroSlides.length;
      setPrevImage(currentImage);
      setFading(true);
      setCurrentImage(next);
      setTimeout(() => {
        setPrevImage(null);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [currentImage, fading]);

  return (
    <section className="relative w-full bg-kibana-cream">
      {/* Preload non-visible images */}
      {heroSlides.map((slide, i) =>
        i !== currentImage ? (
          <div key={`preload-${i}`} style={{ display: "none" }}>
            <link rel="preload" as="image" href={slide.mobile} media="(max-width: 767px)" />
            <link rel="preload" as="image" href={slide.desktop} media="(min-width: 768px)" />
          </div>
        ) : null
      )}

      {/* ── MOBILE container (hidden on md+) — matches 1122×1402 image ratio ── */}
      <div className="relative w-full block md:hidden" style={{ aspectRatio: "1122/1402" }}>
        {prevImage !== null && (
          <Image
            key={`prev-mob-${prevImage}`}
            src={heroSlides[prevImage].mobile}
            alt=""
            fill
            priority={false}
            quality={80}
            sizes="100vw"
            className="object-cover object-center"
            style={{ opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}
          />
        )}
        <Image
          key={`curr-mob-${currentImage}`}
          src={heroSlides[currentImage].mobile}
          alt={heroSlides[currentImage].alt}
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover object-center"
          style={{ opacity: 1, transition: "opacity 0.6s ease-in-out" }}
        />
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => goTo(index)}
              className={`h-2 w-2 transition-all cursor-pointer ${index === currentImage ? "bg-kibana-ink/80" : "bg-kibana-ink/30"}`}
              aria-label={`View image ${index + 1}`} />
          ))}
        </div>
      </div>

      {/* ── DESKTOP / TABLET container (hidden below md) — matches 2172×724 image ratio ── */}
      <div className="relative w-full hidden md:block" style={{ aspectRatio: "2172/724" }}>
        {prevImage !== null && (
          <Image
            key={`prev-desk-${prevImage}`}
            src={heroSlides[prevImage].desktop}
            alt=""
            fill
            priority={false}
            quality={80}
            sizes="100vw"
            className="object-cover object-center"
            style={{ opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}
          />
        )}
        <Image
          key={`curr-desk-${currentImage}`}
          src={heroSlides[currentImage].desktop}
          alt={heroSlides[currentImage].alt}
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover object-center"
          style={{ opacity: 1, transition: "opacity 0.6s ease-in-out" }}
        />
        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => goTo(index)}
              className={`h-2 w-2 transition-all cursor-pointer ${index === currentImage ? "bg-kibana-ink/80" : "bg-kibana-ink/30"}`}
              aria-label={`View image ${index + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
