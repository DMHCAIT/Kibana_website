"use client";

import Image from "next/image";
import { useState } from "react";
import { customerReviews } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CustomerReview() {
  const [idx, setIdx] = useState(0);
  const reviews = customerReviews;
  const r = reviews[idx];
  if (!r) return null;

  return (
    <section className="w-full sm:pt-10 md:pt-16">
      {/* Black top section with heading */}
      <div className="bg-kibana-ink py-8 pb-20 text-kibana-cream md:py-12 md:pb-28">
        <div className="container text-center">
          <h2 className="text-base font-bold uppercase tracking-[0.15em] sm:text-lg">
            Customer review
          </h2>
          <p className="mt-2 text-sm text-kibana-cream/70">Real feedback from happy customers</p>
        </div>
      </div>

      {/* Light section with content - avatar overlaps both sections */}
      <div className="relative bg-gray-100 pb-8 pt-12 md:pb-12 md:pt-16">
        <div className="container">
          <div className="mx-auto flex max-w-md flex-col items-center px-4 text-center md:max-w-2xl">
            {/* Avatar - positioned to touch black background */}
            <span className="relative -mt-24 mb-6 h-40 w-40 overflow-hidden rounded-full shadow-2xl ring-4 ring-white sm:h-48 sm:w-48 md:-mt-32 md:mb-8 md:h-56 md:w-56">
              <Image
                src={r.avatar}
                alt={r.name}
                fill
                className="object-cover"
                quality={95}
                priority
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
              />
            </span>

            {/* Stars - thin with sharp corners */}
            <div className="mb-5 mt-2 flex items-center justify-center gap-2 md:mb-6">
              {Array.from({ length: 5 }).map((_, i) => {
                const fullStars = Math.floor(r.rating);
                const hasHalfStar = r.rating % 1 !== 0;
                const isFilled = i < fullStars;
                const isHalf = i === fullStars && hasHalfStar;

                return (
                  <div key={i} className="relative h-6 w-6 md:h-7 md:w-7">
                    {/* Background empty star */}
                    <svg
                      className="absolute inset-0 h-full w-full text-yellow-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>

                    {/* Full filled star */}
                    {isFilled && (
                      <svg
                        className="absolute inset-0 h-full w-full text-yellow-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}

                    {/* Half filled star */}
                    {isHalf && (
                      <svg
                        className="absolute inset-0 h-full w-full text-yellow-400"
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

            {/* Review text */}
            <p className="mb-2 text-sm font-medium text-gray-800 sm:text-base md:text-lg">
              {r.text}
            </p>
            <p className="mb-6 text-xs font-semibold text-gray-700 sm:text-sm md:mb-8">
              — {r.name}
            </p>

            {/* Pagination dots - circular */}
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show review ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "rounded-full transition-all",
                    i === idx ? "h-3 w-3 bg-gray-800" : "h-2 w-2 bg-gray-400",
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
