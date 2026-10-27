import Image from "@/components/ui/image";
import Link from "next/link";
import { genderShelves } from "@/lib/data";

export function ShopByGender() {
  return (
    <section className="container mb-4 py-3">
      <div className="mx-auto grid max-w-xs grid-cols-1 gap-3 sm:max-w-sm sm:gap-4">
        {genderShelves.map((gender) => (
          <Link
            key={gender.slug}
            href="/shop"
            className="group flex flex-col items-center gap-1 text-center"
          >
            <span className="relative aspect-square w-full overflow-hidden rounded-lg bg-kibana-cream">
              <Image
                src={gender.image}
                alt={gender.name}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="px-1 text-center text-[10px] font-semibold uppercase tracking-[0.15em] sm:text-xs md:text-sm">
              {gender.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
