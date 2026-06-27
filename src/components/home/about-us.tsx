import Image from "next/image";
import Link from "next/link";

export function AboutUs() {
  return (
    <section className="overflow-hidden bg-kibana-cream">
      {/* Mobile: container with stacked layout (text first, image second) */}
      <div className="container py-2 sm:hidden">
        <div className="flex flex-col gap-1.5">
          {/* Text */}
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-kibana-camel">
              Our Story
            </p>
            <h2 className="text-base font-bold uppercase leading-tight tracking-[0.15em] text-kibana-ink sm:text-lg">
              Born from
              <br />
              Belief in Beauty
            </h2>
            <div className="my-0.5 h-px w-6 bg-kibana-tan" />
            <p className="text-sm font-light leading-relaxed text-kibana-ink sm:text-base md:text-lg">
              Kibana was born from a simple belief — that luxury should never come at the cost of
              ethics. We craft every bag with the finest cruelty-free materials, ensuring each piece
              is as kind to the planet as it is beautiful.
            </p>
            <Link
              href="/about"
              className="mt-0 inline-flex w-fit items-center gap-2 border border-kibana-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-kibana-ink transition-colors duration-300 hover:bg-kibana-ink hover:text-kibana-cream"
            >
              Discover Our Story
            </Link>
          </div>
          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded">
            <Image
              src="/image_born_our_story.webp"
              alt="About Kibana"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-kibana-tan/10" />
          </div>
        </div>
      </div>

      {/* Desktop: original full-bleed split (image left, text right) */}
      <div className="hidden sm:grid sm:grid-cols-2">
        {/* LEFT — large image */}
        <div className="relative aspect-auto min-h-[480px] w-full">
          <Image
            src="/image_born_our_story.webp"
            alt="About Kibana"
            fill
            sizes="50vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-kibana-tan/10" />
        </div>

        {/* RIGHT — editorial text panel */}
        <div className="flex flex-col justify-center bg-kibana-cream px-12 py-14 md:px-16">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-kibana-camel">
            Our Story
          </p>
          <h2 className="text-base font-bold uppercase leading-tight tracking-[0.15em] text-kibana-ink sm:text-lg">
            Born from
            <br />
            Belief in Beauty
          </h2>
          <div className="mb-5 mt-4 h-px w-10 bg-kibana-tan" />
          <p className="text-sm font-light leading-relaxed text-kibana-ink sm:text-base md:text-lg">
            Kibana was born from a simple belief — that luxury should never come at the cost of
            ethics. We craft every bag with the finest cruelty-free materials, ensuring each piece
            is as kind to the planet as it is beautiful.
          </p>
          <p className="mt-3 text-sm font-light leading-relaxed text-kibana-ink sm:text-base md:text-lg">
            From the stitching to the hardware, every detail is considered — because a Kibana bag
            isn't just an accessory, it's a companion for life.
          </p>
          <Link
            href="/about"
            className="mt-7 inline-flex w-fit items-center gap-2 border border-kibana-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-kibana-ink transition-colors duration-300 hover:bg-kibana-ink hover:text-kibana-cream"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
