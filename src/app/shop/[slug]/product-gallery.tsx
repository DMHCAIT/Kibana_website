"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type Props = {
  images: string[];
  productName: string;
  discountPct: number;
};

export function ProductGallery({ images, productName, discountPct: pct }: Props) {
  const [active, setActive] = useState(0);
  const allImages = images.length > 0 ? images : ["/extracted/img-060.jpg"];

  const hScrollRef = useRef<HTMLDivElement>(null);
  const vScrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* ── Mobile: main image → horizontal thumbs below ── */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:gap-3 md:hidden">
        {/* Main image */}
        <div className="rounded-lg bg-[#f5f1ed] p-3 sm:p-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white">
            <Image
              src={allImages[active]}
              alt={productName}
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 1.5rem), 100vw"
              className="object-cover transition-opacity duration-200"
            />
            {pct > 0 && (
              <Badge variant="discount" className="absolute left-2 top-2 sm:left-3 sm:top-3">
                {pct}% OFF
              </Badge>
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
          <div className="relative mx-auto aspect-[8/11] w-full max-w-[512px] overflow-hidden rounded-lg bg-white">
            <Image
              src={allImages[active]}
              alt={productName}
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 512px"
              className="object-cover transition-opacity duration-200"
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
