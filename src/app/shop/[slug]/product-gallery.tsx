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
      <div className="flex flex-col gap-2 sm:gap-3 md:hidden w-full min-w-0">
        {/* Main image */}
        <div className="p-3 sm:p-4 bg-[#f5f1ed] rounded-lg">
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg bg-white">
            <Image
              src={allImages[active]}
              alt={productName}
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 1.5rem), 100vw"
              className="object-cover transition-opacity duration-200"
            />
            {pct > 0 && (
              <Badge variant="discount" className="absolute left-2 sm:left-3 top-2 sm:top-3">
                {pct}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Horizontal thumb strip — scrollable, no arrows */}
        {allImages.length > 1 && (
          <div ref={hScrollRef} className="flex flex-row gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide w-full px-0.5 sm:px-1">
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-14 sm:w-16 shrink-0 overflow-hidden border-2 transition-all rounded bg-white ${
                  active === i ? "border-kibana-ink" : "border-transparent hover:border-kibana-tan"
                }`}
              >
                <Image src={src} alt={`${productName} ${i + 1}`} fill sizes="(max-width: 640px) 56px, 64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: vertical thumbs on left → main image on right ── */}
      <div className="hidden md:flex flex-row gap-6 w-full">
        {/* Vertical thumb strip — scrollable, no arrows */}
        {allImages.length > 1 && (
          <div ref={vScrollRef} className="flex flex-col gap-2 overflow-y-auto scrollbar-hide w-[80px] shrink-0">
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-[72px] shrink-0 overflow-hidden border-2 transition-all rounded bg-white ${
                  active === i ? "border-kibana-ink" : "border-transparent hover:border-kibana-tan"
                }`}
              >
                <Image src={src} alt={`${productName} ${i + 1}`} fill sizes="72px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="p-6 bg-[#f5f1ed] rounded-lg shrink-0 flex-shrink-0">
          <div className="relative w-[512px] h-[704px] overflow-hidden bg-white rounded-lg flex-shrink-0">
            <Image
              src={allImages[active]}
              alt={productName}
              fill
              priority
              sizes="512px"
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

