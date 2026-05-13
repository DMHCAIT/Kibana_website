import Image from "next/image";
import { Star } from "lucide-react";

const badges = [
  { label: "Trusted" },
  { label: "Verified" },
  { label: "Quality" },
];

export function TrustBadges() {
  return (
    <section className="container py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        {/* Image with circular border */}
        <div className="relative mb-8 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56">
          <div className="absolute inset-0 border-4 border-kibana-camel rounded-full"></div>
          <div className="absolute inset-2 bg-gray-100 rounded-full overflow-hidden">
            <Image
              src="/extracted/img-075.jpg"
              alt="Trust Badge"
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* Badges */}
        <div className="grid grid-cols-3 items-center gap-4 sm:gap-6">
          {badges.map(({ label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-semibold text-kibana-ink">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
