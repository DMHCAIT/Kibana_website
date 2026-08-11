"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Hero banner images — mobile and desktop versions per slide
const heroSlides = [
  {
    mobile: "/mv/mobile-banner-independence day.jpg",
    desktop: "/mv/hero-banner.jpg",
    alt: "Independence Day Collection",
    href: "/shop",
  },
];

const FADE_MS = 600;
const INTERVAL_MS = 5000;
const SWIPE_THRESHOLD = 48;

export function HeroBanner() {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [prevImage, setPrevImage] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === currentImage || fading) return;
      setPrevImage(currentImage);
      setFading(true);
      setCurrentImage(index);
      setTimeout(() => {
        setPrevImage(null);
        setFading(false);
      }, FADE_MS);
    },
    [currentImage, fading],
  );

  const goNext = useCallback(() => {
    goTo((currentImage + 1) % heroSlides.length);
  }, [currentImage, goTo]);

  const goPrev = useCallback(() => {
    goTo((currentImage - 1 + heroSlides.length) % heroSlides.length);
  }, [currentImage, goTo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 10) isSwiping.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) goNext();
    else goPrev();
  };

  // Auto-advance every 5s
  useEffect(() => {
    if (fading) return;
    const timer = setInterval(goNext, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fading, goNext]);

  const slideProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    className: "relative w-full touch-pan-y",
  };

  const imageProps = {
    fill: true as const,
    unoptimized: true,
    className: "object-cover object-center select-none",
    draggable: false,
  };

  const handleBannerClick = () => {
    if (isSwiping.current) {
      isSwiping.current = false;
      return;
    }
    const href = heroSlides[currentImage]?.href;
    if (href) router.push(href);
  };

  return (
    <section className="relative w-full bg-kibana-cream">
      {/* ── MOBILE — matches 1122×1402 image ratio ── */}
      <div className="block md:hidden">
        <div
          {...slideProps}
          className={`${slideProps.className} cursor-pointer`}
          style={{ aspectRatio: "1122/1402" }}
          onClick={handleBannerClick}
        >
          {prevImage !== null && (
            <Image
              key={`prev-mob-${prevImage}`}
              src={heroSlides[prevImage].mobile}
              alt=""
              {...imageProps}
              style={{ opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}
            />
          )}
          <Image
            key={`curr-mob-${currentImage}`}
            src={heroSlides[currentImage].mobile}
            alt={heroSlides[currentImage].alt}
            priority
            {...imageProps}
            style={{ opacity: 1, transition: "opacity 0.6s ease-in-out" }}
          />
          {/* Shop Now Button */}
          <div
            className="absolute z-20"
            style={{ top: "68%", left: "18%", transform: "translateX(-50%)" }}
          >
            <button
              onClick={handleBannerClick}
              className="xs:px-4 xs:py-1.5 xs:text-sm whitespace-nowrap rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-orange-600 sm:px-5 sm:py-2 sm:text-base md:px-6"
            >
              Shop Now
            </button>
          </div>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index);
                }}
                className={`h-2 w-2 cursor-pointer transition-all ${index === currentImage ? "bg-kibana-ink/80" : "bg-kibana-ink/30"}`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP / TABLET — matches 2172×724 image ratio ── */}
      <div className="hidden md:block">
        <div
          {...slideProps}
          className={`${slideProps.className} cursor-pointer`}
          style={{ aspectRatio: "2172/724" }}
          onClick={handleBannerClick}
        >
          {prevImage !== null && (
            <Image
              key={`prev-desk-${prevImage}`}
              src={heroSlides[prevImage].desktop}
              alt=""
              {...imageProps}
              style={{ opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}
            />
          )}
          <Image
            key={`curr-desk-${currentImage}`}
            src={heroSlides[currentImage].desktop}
            alt={heroSlides[currentImage].alt}
            priority
            {...imageProps}
            style={{ opacity: 1, transition: "opacity 0.6s ease-in-out" }}
          />
          {/* Shop Now Button */}
          <div
            className="absolute z-20"
            style={{ top: "86%", left: "12%", transform: "translateX(-50%)" }}
          >
            <button
              onClick={handleBannerClick}
              className="whitespace-nowrap rounded-lg bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-orange-600 sm:px-4 sm:py-1 sm:text-xs md:px-5 md:py-1.5 md:text-sm lg:px-6 lg:py-2 lg:text-base xl:px-8"
            >
              Shop Now
            </button>
          </div>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-6 sm:gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index);
                }}
                className={`h-1.5 w-1.5 cursor-pointer transition-all sm:h-2 sm:w-2 ${index === currentImage ? "bg-kibana-ink/80" : "bg-kibana-ink/30"}`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
