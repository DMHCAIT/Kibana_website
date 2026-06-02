"use client";

import Image from "next/image";

export function ResponsiveImage({
  src,
  alt = "",
  width,
  height,
  className,
  sizes,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
}) {
  if (!src) return null;

  // If width/height provided, render fixed image which Next can optimize.
  if (width && height) {
    return (
      <Image src={src} alt={alt} width={width} height={height} className={className} sizes={sizes} />
    );
  }

  // Otherwise render fill image inside a positioned container.
  return (
    <div className={className ?? "relative w-full h-full"} style={{ position: "relative" }}>
      <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes={sizes ?? "100vw"} />
    </div>
  );
}
