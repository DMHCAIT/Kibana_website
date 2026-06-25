import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

export function CategoryPills() {
  return (
    <section className="container py-3 md:py-5">
      <ul className="flex justify-center gap-4 sm:gap-6 md:gap-10">
        {categories.map((category) => (
          <li key={category.slug} className="flex-shrink-0">
            <Link
              href={`/shop?cat=${category.slug}`}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="relative h-20 w-20 overflow-hidden rounded-lg bg-kibana-cream transition-all hover:shadow-md sm:h-32 sm:w-32 md:h-44 md:w-44 lg:h-48 lg:w-48">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 640px) 80px, (max-width: 1024px) 144px, 192px"
                />
              </span>
              <span className="text-center text-[9px] font-semibold uppercase tracking-[0.15em] sm:text-xs md:text-sm">
                {category.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
