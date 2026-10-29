import Image from "@/components/ui/image";

export function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-kibana-tile">
      <div className="relative aspect-[4/5] w-full sm:aspect-[3/1]">
        <div className="absolute inset-0">
          <Image
            src="/mv/women-hero-desktop.webp"
            alt="Kibana women's bag collection"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="hidden object-cover sm:block"
          />
          <Image
            src="/mv/hero1.webp"
            alt="Kibana women's bag collection"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover sm:hidden"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>
    </section>
  );
}
