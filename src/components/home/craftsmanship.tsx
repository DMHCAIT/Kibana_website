import Image from "next/image";

export function Craftsmanship() {
  return (
    <section className="container pt-2 pb-6 md:pt-3 md:pb-10">
      <div className="relative w-full aspect-[16/7] overflow-hidden">
        <Image
          src="/extracted/craftmanship.png"
          alt="Craftsmanship"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* centred text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-display italic font-bold text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide drop-shadow-xl">
            Craftsmanship
          </p>
        </div>
      </div>
    </section>
  );
}
