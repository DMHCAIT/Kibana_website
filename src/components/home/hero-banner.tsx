import Image from "@/components/ui/image";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-kibana-tile">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] md:aspect-[3/1]">
        <div className="absolute inset-0 animate-kenburns">
          <Image
            src="/mv/women-hero-desktop.jpg.jpeg"
            alt="Kibana women's bag collection"
            fill
            priority
            sizes="100vw"
            className="hidden object-cover sm:block"
          />
          <Image
            src="/mv/hero1.jpg.jpeg"
            alt="Kibana women's bag collection"
            fill
            priority
            sizes="100vw"
            className="object-cover sm:hidden"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-12 text-center text-white md:pb-14">
          <Link
            href="/shop"
            className="link-underline mt-5 animate-fadeUp font-sans text-[12px] uppercase tracking-[0.24em] text-white"
            style={{ animationDelay: "360ms" }}
          >
            See Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
