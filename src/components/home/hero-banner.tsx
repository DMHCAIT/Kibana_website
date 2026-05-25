"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Hero banner images (mobile & desktop)
const heroImages = [
  "/mv/hero1.jpg.jpeg",
  "/mv/hero2.jpg.jpeg",
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
      const next = (currentImage + 1) % heroImages.length;
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
    <section className="relative w-full overflow-hidden bg-kibana-cream h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[75vh] max-h-[800px]">
      {/* Preload non-visible images */}
      {heroImages.map((src, i) =>
        i !== currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <link key={`preload-${i}`} rel="preload" as="image" href={src} />
        ) : null
      )}

      {/* Previous image (fading out) */}
      {prevImage !== null && (
        <Image
          key={`prev-${prevImage}`}
          src={heroImages[prevImage]}
          alt=""
          fill
          priority={false}
          quality={85}
          sizes="100vw"
          className="object-cover object-top"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 0.6s ease-in-out" }}
        />
      )}

      {/* Current image (fading in) */}
      <Image
        key={`curr-${currentImage}`}
        src={heroImages[currentImage]}
        alt="Kibana Hero"
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover object-top"
        style={{ opacity: 1, transition: "opacity 0.6s ease-in-out" }}
      />

      {/* Pagination dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`h-2 w-2 transition-all cursor-pointer ${
              index === currentImage ? "bg-kibana-ink/80" : "bg-kibana-ink/30"
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
