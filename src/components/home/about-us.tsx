import Image from "@/components/ui/image";
import Link from "next/link";

export function AboutUs() {
  return (
    <section className="w-full">
      <div className="grid w-full items-stretch md:grid-cols-2">
        <div className="group relative aspect-[4/3] w-full overflow-hidden bg-kibana-tile md:aspect-auto md:min-h-[560px]">
          <Image
            src="/our_story.webp"
            alt="About Kibana"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] object-cover object-center transition-transform group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex items-center justify-center bg-kibana-tile px-6 py-12 text-center sm:px-12 md:py-16 lg:px-20">
          <div className="max-w-md">
            <p className="eyebrow mb-4">Our Story</p>
            <h2 className="section-title">
              Born from
              <br />
              Belief in Beauty
            </h2>
            <p className="mt-6 text-[14px] leading-[1.9] text-foreground/75">
              Kibana was born from a simple belief — that luxury should never come at the cost of
              ethics. We craft every bag with the finest cruelty-free materials, ensuring each piece
              is as kind to the planet as it is beautiful.
            </p>
            <p className="mt-4 text-[14px] leading-[1.9] text-foreground/75">
              From the stitching to the hardware, every detail is considered — because a Kibana bag
              isn&apos;t just an accessory, it&apos;s a companion for life.
            </p>
            <Link href="/about" className="btn-pill mt-8">
              Discover Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
