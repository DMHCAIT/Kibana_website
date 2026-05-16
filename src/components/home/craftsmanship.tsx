import Image from "next/image";

type CraftsmanshipConfig = { image?: string; text?: string };

export function Craftsmanship({ config }: { config?: CraftsmanshipConfig }) {
  const image = config?.image || "/extracted/craftmanship.png";
  const text  = config?.text  || "Craftsmanship";

  return (
    <section className="container pt-2 pb-6 md:pt-3 md:pb-10">
      <div className="relative w-full aspect-[16/7] overflow-hidden">
        <Image
          src={image}
          alt={text}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* centred text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-display italic font-normal text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.12em] drop-shadow-lg">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}
