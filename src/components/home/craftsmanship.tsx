import Image from "next/image";

const details = [
  { image: "/extracted/img-014.jpg", label: "Hand-Stitched Edges", desc: "Finished by hand" },
  { image: "/extracted/img-060.jpg", label: "Gold-Tone Hardware", desc: "Solid brass fittings" },
  { image: "/extracted/img-070.jpg", label: "Vegan Leather", desc: "Certified cruelty-free" },
  { image: "/extracted/img-080.jpg", label: "Artisan Finish", desc: "Precision crafted" },
];

export function Craftsmanship() {
  return (
    <section className="bg-kibana-stone overflow-hidden">
      <div className="container py-6 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 items-stretch">

          {/* LEFT — fully centred text card */}
          <div className="flex flex-col justify-center gap-4">
            {/* top label */}
            <span className="inline-block text-[10px] tracking-[0.45em] uppercase text-kibana-camel font-semibold">
              The Kibana Standard
            </span>

            {/* main headline */}
            <div>
              <p className="font-bold uppercase tracking-[0.15em] text-2xl sm:text-3xl md:text-4xl text-kibana-ink mb-1">
                Craftsmanship
              </p>
              <h3 className="font-display text-base sm:text-lg md:text-xl leading-tight text-kibana-ink/70">
                Crafted with Conscious Luxury
              </h3>
            </div>

            <div className="w-10 h-px bg-kibana-tan" />

            <p className="text-xs sm:text-sm text-kibana-ink/60 leading-relaxed">
              Our artisans hand-finish each stitch, polish every clasp, and choose only the finest cruelty-free vegan leathers — because true luxury means nothing is overlooked.
            </p>

            <ul className="flex flex-col gap-2.5">
              {[
                "Hand-stitched edges by skilled artisans",
                "Certified cruelty-free vegan leather",
                "Solid brass gold-tone hardware",
                "Premium fully lined interiors",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-xs text-kibana-ink/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-kibana-tan" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — 2x2 image grid with gaps */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {details.map((d) => (
              <div key={d.label} className="relative aspect-[4/3] overflow-hidden group">
                <Image
                  src={d.image}
                  alt={d.label}
                  fill
                  sizes="(max-width: 640px) 45vw, 22vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kibana-ink/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white leading-none">
                    {d.label}
                  </p>
                  <p className="text-[8px] text-white/60 mt-0.5">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
