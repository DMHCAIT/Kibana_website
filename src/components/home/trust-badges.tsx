import Image from "@/components/ui/image";
import { Star } from "lucide-react";

const badges = [{ label: "Trusted" }, { label: "Verified" }, { label: "Quality" }];

export function TrustBadges() {
  return (
    <section className="container py-12 md:py-16">
      <div className="flex flex-col items-center text-center">
        {/* Image with circular border */}
        <div className="relative mb-8 h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56">
          <div className="absolute inset-0 rounded-full border-4 border-kibana-camel"></div>
          <div className="absolute inset-2 overflow-hidden rounded-full bg-gray-100">
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
        <div className="mb-8 flex items-center justify-center gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5" />
          ))}
        </div>

        {/* Badges */}
        <div className="grid grid-cols-3 items-center gap-4 sm:gap-6">
          {badges.map(({ label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-kibana-ink sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
