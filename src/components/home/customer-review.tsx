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
    <section className="container">
      {/* Black top section with heading */}
      <div className="bg-kibana-ink text-kibana-cream py-8 md:py-12 pb-20 md:pb-28">
        <div className="text-center">
          <h2 className="font-bold text-2xl sm:text-3xl uppercase tracking-[0.15em]">Customer review</h2>
          <p className="text-sm text-kibana-cream/70 mt-2">Real feedback from happy customers</p>
        </div>
      </div>

      {/* Light section with content - avatar overlaps both sections */}
      <div className="bg-gray-100 relative pt-12 md:pt-16 pb-8 md:pb-12">
        <div className="flex flex-col items-center text-center max-w-md md:max-w-2xl mx-auto px-4">
            {/* Avatar - positioned to touch black background */}
            <span className="relative h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 overflow-hidden rounded-full ring-4 ring-white shadow-lg -mt-24 md:-mt-32 mb-6 md:mb-8">
              <Image src={r.avatar} alt={r.name} fill className="object-cover" sizes="256px" />
            </span>
            
            {/* Stars - thin with sharp corners */}
            <div className="flex items-center gap-2 justify-center mb-5 md:mb-6 mt-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const fullStars = Math.floor(r.rating);
                const hasHalfStar = r.rating % 1 !== 0;
                const isFilled = i < fullStars;
                const isHalf = i === fullStars && hasHalfStar;
                
                return (
                  <div key={i} className="relative w-6 h-6 md:w-7 md:h-7">
                    {/* Background empty star */}
                    <svg className="absolute inset-0 w-full h-full text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    
                    {/* Full filled star */}
                    {isFilled && (
                      <svg className="absolute inset-0 w-full h-full text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                    
                    {/* Half filled star */}
                    {isHalf && (
                      <svg className="absolute inset-0 w-full h-full text-yellow-400" viewBox="0 0 24 24" fill="currentColor" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Review text */}
            <p className="text-sm sm:text-base md:text-lg text-gray-800 font-medium mb-2">
              "{r.text}"
            </p>
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-6 md:mb-8">— {r.name}</p>

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
    </section>
  );
}
