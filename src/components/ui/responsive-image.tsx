"use client";

import Image from "next/image";

export function ResponsiveImage({
  src,
  alt = "",
  width,
  height,
  className,
  sizes,
  fill,
  priority,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
}) {
  if (!src) return null;

  // If width/height provided, render fixed image which Next can optimize.
  if (width && height) {
    return (
      <Image src={src} alt={alt} width={width} height={height} className={className} sizes={sizes} priority={priority} />
    );
  }

  // If fill prop is used, render fill image inside a positioned container.
  if (fill) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes={sizes ?? "100vw"} priority={priority} className={className} />
      </div>
    );
  }

  // Otherwise render fill image inside a positioned container.
  return (
    <div className={className ?? "relative w-full h-full"} style={{ position: "relative" }}>
      <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes={sizes ?? "100vw"} priority={priority} />
    </div>
  );
}
