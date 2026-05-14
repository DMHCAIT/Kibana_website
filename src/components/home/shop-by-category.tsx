import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import { SectionHeading } from "./section-heading";

export function ShopByCategory() {
  return (
    <section className="container py-4 md:py-8">
      <SectionHeading title="Shop by Category" />
      {/* 2 per row on mobile, 3 per row on tablet and desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?cat=${c.slug}`}
            className="group flex flex-col items-center gap-1 text-center"
          >
            <span className="relative w-full aspect-square overflow-hidden bg-kibana-cream">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 40vw, 28vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-center leading-tight">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
