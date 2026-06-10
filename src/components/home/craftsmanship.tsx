import Image from "next/image";

type CraftsmanshipConfig = { image?: string; text?: string };

export function Craftsmanship({ config }: { config?: CraftsmanshipConfig }) {
  const image = config?.image || "/extracted/craftmanship.webp";
  const text = config?.text || "Craftsmanship";

  return (
    <section className="container pb-6 pt-2 md:pb-10 md:pt-3">
      <div className="relative aspect-[16/7] w-full overflow-hidden">
        <Image src={image} alt={text} fill sizes="100vw" className="object-cover" priority />
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* centred text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-display text-3xl font-normal italic tracking-[0.12em] text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}
