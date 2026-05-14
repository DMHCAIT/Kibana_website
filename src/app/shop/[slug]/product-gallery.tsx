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
      <div className="flex flex-col gap-3 md:hidden">
        {/* Main image */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#f0ece4]">
          <Image
            src={allImages[active]}
            alt={productName}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-opacity duration-200"
          />
          {pct > 0 && (
            <Badge variant="discount" className="absolute left-3 top-3">
              {pct}% OFF
            </Badge>
          )}
        </div>

        {/* Horizontal thumb strip — scrollable, no arrows */}
        {allImages.length > 1 && (
          <div ref={hScrollRef} className="flex flex-row gap-2 overflow-x-auto scrollbar-hide">
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-16 shrink-0 overflow-hidden border-2 transition-all ${
                  active === i ? "border-kibana-ink" : "border-transparent hover:border-kibana-tan"
                }`}
              >
                <Image src={src} alt={`${productName} ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: vertical thumbs on left → main image on right ── */}
      <div className="hidden md:flex flex-row gap-3 h-full">
        {/* Vertical thumb strip — scrollable, no arrows */}
        {allImages.length > 1 && (
          <div ref={vScrollRef} className="flex flex-col gap-2 overflow-y-auto scrollbar-hide w-[72px] shrink-0">
            {allImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-[68px] shrink-0 overflow-hidden border-2 transition-all ${
                  active === i ? "border-kibana-ink" : "border-transparent hover:border-kibana-tan"
                }`}
              >
                <Image src={src} alt={`${productName} ${i + 1}`} fill sizes="68px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-[#f0ece4]">
          <Image
            src={allImages[active]}
            alt={productName}
            fill
            priority
            sizes="50vw"
            className="object-cover transition-opacity duration-200"
          />
          {pct > 0 && (
            <Badge variant="discount" className="absolute left-3 top-3">
              {pct}% OFF
            </Badge>
          )}
        </div>
      </div>
    </>
  );
}

