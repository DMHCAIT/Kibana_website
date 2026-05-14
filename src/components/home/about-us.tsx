import Image from "next/image";
import Link from "next/link";

export function AboutUs() {
  return (
    <section className="bg-kibana-cream overflow-hidden">
      {/* Mobile: container with stacked layout (text first, image second) */}
      <div className="sm:hidden container py-8">
        <div className="flex flex-col gap-5">
          {/* Text */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] tracking-[0.5em] uppercase text-kibana-camel font-medium">
              Our Story
            </p>
            <h2 className="font-display text-2xl leading-tight text-kibana-ink">
              Born from<br />Belief in Beauty
            </h2>
            <div className="w-10 h-px bg-kibana-tan" />
            <p className="text-xs text-kibana-ink/60 leading-relaxed">
              Kibana was born from a simple belief — that luxury should never come at the cost of ethics. We craft every bag with the finest cruelty-free materials, ensuring each piece is as kind to the planet as it is beautiful.
            </p>
            <Link
              href="/about"
              className="mt-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-kibana-ink border border-kibana-ink px-4 py-2 w-fit hover:bg-kibana-ink hover:text-kibana-cream transition-colors duration-300"
            >
              Discover Our Story
            </Link>
          </div>
          {/* Image */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src="/extracted/img-050.jpg"
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
        <div className="relative w-full aspect-auto min-h-[480px]">
          <Image
            src="/extracted/img-050.jpg"
            alt="About Kibana"
            fill
            sizes="50vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-kibana-tan/10" />
        </div>

        {/* RIGHT — editorial text panel */}
        <div className="flex flex-col justify-center px-12 py-14 md:px-16 bg-kibana-cream">
          <p className="text-[10px] tracking-[0.5em] uppercase text-kibana-camel font-medium mb-4">
            Our Story
          </p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight text-kibana-ink">
            Born from<br />Belief in Beauty
          </h2>
          <div className="mt-4 mb-5 w-10 h-px bg-kibana-tan" />
          <p className="text-xs sm:text-sm text-kibana-ink/60 leading-relaxed">
            Kibana was born from a simple belief — that luxury should never come at the cost of ethics. We craft every bag with the finest cruelty-free materials, ensuring each piece is as kind to the planet as it is beautiful.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-kibana-ink/60 leading-relaxed">
            From the stitching to the hardware, every detail is considered — because a Kibana bag isn't just an accessory, it's a companion for life.
          </p>
          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-kibana-ink border border-kibana-ink px-5 py-2.5 w-fit hover:bg-kibana-ink hover:text-kibana-cream transition-colors duration-300"
          >
            Discover Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}

