"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type Props = {
  images: string[];
  productName: string;
  discountPct: number;
  variantInStock?: boolean;
};

const SWIPE_THRESHOLD = 48;

export function ProductGallery({ images, productName, discountPct: pct, variantInStock = true }: Props) {
  const [active, setActive] = useState(0);
  const allImages = images.length > 0 ? images : ["/extracted/img-060.jpg"];

  const hScrollRef = useRef<HTMLDivElement>(null);
  const vScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const imageKey = allImages.join("|");

  useEffect(() => {
    setActive(0);
  }, [imageKey]);

  useEffect(() => {
    const hThumb = hScrollRef.current?.children[active] as HTMLElement | undefined;
    hThumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    const vThumb = vScrollRef.current?.children[active] as HTMLElement | undefined;
    vThumb?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "center" });
  }, [active]);

  const goNext = useCallback(() => {
    if (allImages.length <= 1) return;
    setActive((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    if (allImages.length <= 1) return;
    setActive((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

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
    if (!isSwiping.current || allImages.length <= 1) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) goNext();
    else goPrev();
  };

  const swipeProps =
    allImages.length > 1
      ? {
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
          className:
            "relative aspect-[3/4] w-full touch-pan-y overflow-hidden rounded-lg bg-white select-none",
        }
      : {
          className: "relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white",
        };

  const desktopSwipeProps =
    allImages.length > 1
      ? {
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
          className:
            "relative mx-auto aspect-[8/11] w-full max-w-[512px] touch-pan-y overflow-hidden rounded-lg bg-white select-none",
        }
      : {
          className:
            "relative mx-auto aspect-[8/11] w-full max-w-[512px] overflow-hidden rounded-lg bg-white",
        };

  return (
    <>
      {/* ── Mobile: main image → horizontal thumbs below ── */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:gap-3 md:hidden">
        {/* Main image */}
        <div className="rounded-lg bg-[#f5f1ed] p-3 sm:p-4">
          <div {...swipeProps}>
            <Image
              src={allImages[active]}
              alt={productName}
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 1.5rem), 100vw"
              className="object-cover transition-opacity duration-200"
              draggable={false}
            />
            {pct > 0 && (
              <Badge variant="discount" className="absolute left-2 top-2 sm:left-3 sm:top-3">
                {pct}% OFF
              </Badge>
            )}
            {!variantInStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-600 text-white font-bold text-sm sm:text-base px-4 py-2 tracking-wide">OUT OF STOCK</span>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal thumb strip — scrollable, no arrows */}
        {allImages.length > 1 && (
          <div
            ref={hScrollRef}
            className="scrollbar-hide flex w-full flex-row gap-1.5 overflow-x-auto px-0.5 sm:gap-2 sm:px-1"
          >
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded border-2 bg-white transition-all sm:w-16 ${
                  active === i ? "border-kibana-ink" : "border-transparent hover:border-kibana-tan"
                }`}
              >
                <Image
                  src={src}
                  alt={`${productName} ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 56px, 64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: vertical thumbs on left → main image on right ── */}
      <div className="hidden w-full flex-row gap-6 md:flex">
        {/* Vertical thumb strip — scrollable, no arrows */}
        {allImages.length > 1 && (
          <div
            ref={vScrollRef}
            className="scrollbar-hide flex w-[80px] shrink-0 flex-col gap-2 overflow-y-auto"
          >
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-[72px] shrink-0 overflow-hidden rounded border-2 bg-white transition-all ${
                  active === i ? "border-kibana-ink" : "border-transparent hover:border-kibana-tan"
                }`}
              >
                <Image
                  src={src}
                  alt={`${productName} ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image — fluid up to 512px wide so it never overflows on tablets */}
        <div className="min-w-0 flex-1 rounded-lg bg-[#f5f1ed] p-6">
          <div {...desktopSwipeProps}>
            {!variantInStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <span className="bg-red-600 text-white font-bold text-lg px-6 py-3 tracking-wide">OUT OF STOCK</span>
              </div>
            )}
            <Image
              src={allImages[active]}
              alt={productName}
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 512px"
              className="object-cover transition-opacity duration-200"
              draggable={false}
            />
            {pct > 0 && (
              <Badge variant="discount" className="absolute left-3 top-3">
                {pct}% OFF
              </Badge>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
