import Image from "next/image";
import Link from "next/link";
import { genderShelves } from "@/lib/data";

export function ShopByGender() {
  return (
    <section className="container py-3 mb-4">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 max-w-sm sm:max-w-md md:max-w-lg mx-auto">
        {genderShelves.map((gender) => (
          <Link
            key={gender.slug}
            href={`/shop?gender=${gender.slug}`}
            className="group flex flex-col items-center gap-1 text-center"
          >
            <span className="relative w-full aspect-square overflow-hidden bg-kibana-cream">
              <Image
                src={gender.image}
                alt={gender.name}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-center px-1">
              {gender.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
