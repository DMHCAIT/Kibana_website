import Image from "next/image";
import { SectionHeading } from "./section-heading";

export function BestSellers() {
  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Best Sellers" />
      <div className="relative overflow-hidden">
          <div className="relative h-56 sm:h-72 md:h-[380px] lg:h-[480px]">
          <Image
            src="/extracted/img-050.jpg"
            alt="Best sellers"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </section>
  );
}
