import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import { SectionHeading } from "./section-heading";

export function ShopByCategory() {
  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Shop by Category" />
      <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?cat=${c.slug}`}
            className="group flex flex-col items-center gap-2.5 text-center"
          >
            <span className="relative w-full aspect-square overflow-hidden bg-kibana-cream">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-center px-1">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
