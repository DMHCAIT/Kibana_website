import Image from "next/image";
import Link from "next/link";
import { genderShelves } from "@/lib/data";

export function CategoryPills() {
  return (
    <section className="container py-3 md:py-5">
      <ul className="flex justify-center gap-4 sm:gap-6 md:gap-10">
        {genderShelves.map((g) => (
          <li key={g.slug} className="flex-shrink-0">
            <Link href={`/shop?gender=${g.slug}`} className="flex flex-col items-center gap-1.5">
              <span className="relative w-20 h-20 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 overflow-hidden bg-kibana-cream hover:shadow-md transition-all">
                <Image src={g.image} alt={g.name} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 80px, (max-width: 1024px) 144px, 192px" />
              </span>
              <span className="text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase text-center">
                {g.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
