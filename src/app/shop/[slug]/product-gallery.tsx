"use client";

import { useState } from "react";
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

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Main image */}
      <div className="relative w-full aspect-square sm:aspect-[4/5] overflow-hidden bg-[#f0ece4]">
        <Image
          src={allImages[active]}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-200"
        />
        {pct > 0 && (
          <Badge variant="discount" className="absolute left-3 top-3">
            {pct}% OFF
          </Badge>
        )}
      </div>

      {/* Thumbnail strip — horizontal on all sizes */}
      {allImages.length > 1 && (
        <div className="flex flex-row gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-16 sm:w-20 shrink-0 overflow-hidden border-2 transition-all ${
                active === i
                  ? "border-gray-900"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={src}
                alt={`${productName} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
