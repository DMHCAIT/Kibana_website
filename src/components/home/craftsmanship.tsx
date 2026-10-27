import Image from "@/components/ui/image";
import { Scissors, Gem } from "lucide-react";

type CraftsmanshipConfig = { image?: string; text?: string };

export function Craftsmanship() {
  return (
    <section className="w-full bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-12 sm:px-5 md:px-6 md:py-16 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Text Content */}
          <div className="order-2 md:order-1">
            {/* Section Label */}
            <p className="mb-4 text-xs font-light tracking-widest text-muted-foreground md:text-sm">
              THE MAKING
            </p>

            {/* Main Heading */}
            <h2 className="mb-6 font-playfair text-4xl font-light text-foreground md:text-5xl lg:text-6xl">
              Crafted with
              <br />
              Intention
            </h2>

            {/* Description */}
            <p className="mb-10 text-sm font-light leading-relaxed text-muted-foreground md:text-base">
              Behind every KIBANA bag is a story of craftsmanship — where traditional techniques
              meet contemporary design. From the first cut of leather to the final stitch, each
              piece is created with purpose and precision.
            </p>

            {/* Features Grid */}
            <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Precision Stitching */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Scissors className="mt-1 h-6 w-6 text-accent/70" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-playfair text-lg font-light text-foreground">
                      Precision Stitching
                    </h3>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground">
                      Every seam is crafted with meticulous attention, ensuring durability that
                      lasts for years.
                    </p>
                  </div>
                </div>
              </div>

              {/* Premium Materials */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Gem className="mt-1 h-6 w-6 text-accent/70" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-playfair text-lg font-light text-foreground">
                      Premium Materials
                    </h3>
                    <p className="text-sm font-light leading-relaxed text-muted-foreground">
                      Sourced from the finest tanneries, our leathers are selected for their quality
                      and character.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="order-1 md:order-2">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {/* Large Image */}
              <div className="col-span-1 row-span-2">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <Image
                    src="/craftsmanship-1.jpg"
                    alt="Precision Stitching Detail"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Small Images */}
              <div className="col-span-1">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1/1" }}>
                  <Image
                    src="/craftsmanship-2.jpg"
                    alt="Leather Detail"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="col-span-1">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1/1" }}>
                  <Image
                    src="/craftsmanship-3.jpg"
                    alt="Material Quality"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
