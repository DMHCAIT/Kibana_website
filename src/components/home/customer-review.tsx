"use client";

import Image from "@/components/ui/image";
import { useState } from "react";
import { customerReviews } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CustomerReview() {
  const [idx, setIdx] = useState(0);
  const reviews = customerReviews;
  const r = reviews[idx];
  if (!r) return null;

  return (
    <section className="w-full">
      {/* Dark Premium Header */}
      <div className="bg-foreground py-16 pb-32 text-background md:py-24 md:pb-40 lg:py-32 lg:pb-48">
        <div className="mx-auto w-full max-w-[1600px] px-3 text-center sm:px-5 md:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Customer Stories
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light tracking-wide text-background/80 md:text-xl">
            Real feedback from thousands of happy customers who trust Kibana
          </p>

          {/* Decorative line */}
          <div className="mx-auto mt-8 h-px w-12 bg-accent" />
        </div>
      </div>

      {/* Light Section with Avatar Overlap */}
      <div className="relative bg-background/50 pb-16 pt-32 md:pb-20 md:pt-40 lg:pb-24 lg:pt-48">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <span className="relative -mt-40 mb-10 h-56 w-56 overflow-hidden rounded-full shadow-2xl ring-8 ring-background sm:h-64 sm:w-64 md:-mt-48 md:mb-12 md:h-72 md:w-72 lg:-mt-56">
              <Image
                src={r.avatar}
                alt={r.name}
                fill
                className="object-cover"
                quality={95}
                priority
                sizes="(max-width: 639px) 224px, (max-width: 767px) 256px, 288px"
              />
            </span>

            {/* Stars */}
            <div className="mb-8 flex items-center justify-center gap-3 md:mb-10">
              {Array.from({ length: 5 }).map((_, i) => {
                const fullStars = Math.floor(r.rating);
                const hasHalfStar = r.rating % 1 !== 0;
                const isFilled = i < fullStars;
                const isHalf = i === fullStars && hasHalfStar;

                return (
                  <div key={i} className="relative h-7 w-7 md:h-8 md:w-8">
                    {/* Background empty star */}
                    <svg
                      className="absolute inset-0 h-full w-full text-accent/30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>

                    {/* Full filled star */}
                    {isFilled && (
                      <svg
                        className="absolute inset-0 h-full w-full text-accent"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}

                    {/* Half filled star */}
                    {isHalf && (
                      <svg
                        className="absolute inset-0 h-full w-full text-accent"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Review Text */}
            <p className="mb-6 max-w-3xl text-xl font-light italic leading-relaxed text-foreground md:text-2xl lg:text-3xl">
              "{r.text}"
            </p>
            <p className="mb-12 text-base font-semibold uppercase tracking-widest text-muted-foreground md:mb-16 md:text-lg">
              — {r.name}
            </p>

            {/* Pagination Dots */}
            <div className="flex items-center gap-4">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show review ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === idx
                      ? "h-3 w-3 bg-accent"
                      : "h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
