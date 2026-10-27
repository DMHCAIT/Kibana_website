"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";

type Props = {
  images: string[];
  productName: string;
  discountPct: number;
  variantInStock?: boolean;
};

export function ProductGallery({
  images,
  productName,
  discountPct: pct,
  variantInStock = true,
}: Props) {
  const allImages = images.length > 0 ? images : ["/extracted/img-060.jpg"];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isZoomOpen = zoomed !== null;

  useEffect(() => {
    if (!isZoomOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isZoomOpen]);

  function goTo(index: number) {
    scrollRef.current?.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  }

  function moveZoom(direction: number) {
    setZoomed((current) =>
      current === null ? null : (current + direction + allImages.length) % allImages.length,
    );
  }

  const status = !variantInStock ? (
    <Badge variant="soldOut" className="pointer-events-none absolute left-3 top-3 z-10">
      Sold Out
    </Badge>
  ) : pct > 0 ? (
    <Badge variant="discount" className="pointer-events-none absolute left-3 top-3 z-10">
      {pct}% OFF
    </Badge>
  ) : null;

  return (
    <div className="min-w-0" aria-label={`${productName} gallery`}>
      <div className="lg:hidden">
        <div className="relative">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
            onScroll={(event) => {
              const { scrollLeft, clientWidth } = event.currentTarget;
              if (clientWidth > 0) setActive(Math.round(scrollLeft / clientWidth));
            }}
          >
            {allImages.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                aria-label={`Zoom ${productName} image ${index + 1}`}
                onClick={() => setZoomed(index)}
                className="relative aspect-[4/5] w-full shrink-0 snap-center bg-kibana-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              >
                <Image
                  src={src}
                  alt={`${productName} - image ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1023px) 100vw, 1px"
                  className="object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
          {status}
          <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        {allImages.length > 1 && (
          <div
            className="flex flex-wrap justify-center gap-1 bg-white py-2"
            aria-label="Gallery pagination"
          >
            {allImages.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                aria-label={`View image ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                onClick={() => goTo(index)}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${active === index ? "bg-foreground" : "bg-foreground/30"}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden grid-cols-2 gap-1 lg:grid">
        {allImages.map((src, index) => (
          <div key={`${src}-${index}`} className={`relative ${index === 0 ? "col-span-2" : ""}`}>
            <button
              type="button"
              aria-label={`Zoom ${productName} image ${index + 1}`}
              onClick={() => setZoomed(index)}
              className="group/gallery relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-kibana-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            >
              <Image
                src={src}
                alt={`${productName} - image ${index + 1}`}
                fill
                priority={index === 0}
                sizes={
                  index === 0 ? "(min-width: 1024px) 52vw, 1px" : "(min-width: 1024px) 26vw, 1px"
                }
                className="object-cover"
              />
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover/gallery:opacity-100 group-focus-visible/gallery:opacity-100">
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
            {index === 0 && status}
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${productName} image viewer`}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 backdrop:bg-black/60"
        onCancel={() => setZoomed(null)}
        onClose={() => setZoomed(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setZoomed(null);
          }
          if (event.key === "ArrowLeft") moveZoom(-1);
          if (event.key === "ArrowRight") moveZoom(1);
        }}
      >
        {zoomed !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-end px-5 py-3">
              <button
                type="button"
                aria-label="Close image viewer"
                onClick={() => setZoomed(null)}
                className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <Image
                src={allImages[zoomed]}
                alt={`${productName} - image ${zoomed + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-6 py-4">
              {allImages.length > 1 && (
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => moveZoom(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <span className="text-xs" aria-live="polite">
                {zoomed + 1} / {allImages.length}
              </span>
              {allImages.length > 1 && (
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => moveZoom(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
