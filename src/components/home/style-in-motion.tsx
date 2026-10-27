"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Truck, Gem, RotateCcw } from "lucide-react";
import { SectionHeading } from "./section-heading";

type Tile = { alt: string; label: string; href: string; video?: string };

const TILES: Tile[] = [
  {
    alt: "Sandesh - Mocha",
    label: "Sandesh - Mocha",
    href: "/shop/sandesh-mocha",
    video: "/videos/compressed/Sandesh%20Laptop%20bag.mp4",
  },
  {
    alt: "Vistara - Mocha",
    label: "Vistara - Mocha",
    href: "/shop/vistara-mocha",
    video: "/videos/compressed/VISTARA%20TOTE%20BAG.mp4",
  },
  {
    alt: "Prizma - Mocha",
    label: "Prizma - Mocha",
    href: "/shop/prizma-mocha",
    video: "/videos/compressed/PRIZMA%20SLING.mp4",
  },
  {
    alt: "Vistapack - Mocha",
    label: "Vistapack - Mocha",
    href: "/shop/vistapack-mocha",
    video: "/videos/compressed/HALO%20MINI%20Optimized.mp4",
  },
];

const badges = [
  { icon: Truck, label: "Delivery in 4 days" },
  { icon: Gem, label: "Premium Quality" },
  { icon: RotateCcw, label: "Easy Returns" },
];

function TileCard({ tile }: { tile: Tile }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!tile.video || !cardRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [tile.video]);

  useEffect(() => {
    if (!tile.video || !videoRef.current) return;
    if (isInView) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isInView, tile.video]);

  return (
    <Link
      href={tile.href}
      ref={cardRef}
      className="group block w-[62vw] shrink-0 snap-start sm:w-auto"
    >
      <div className="relative aspect-[9/14] w-full overflow-hidden bg-kibana-tile">
        {tile.video && (
          <video
            ref={videoRef}
            src={tile.video}
            muted
            loop
            playsInline
            preload="none"
            className="duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-[1.06]"
          />
        )}
      </div>
      <p className="product-title mt-4 text-center">{tile.label}</p>
      <p className="mt-1.5 text-center">
        <span className="link-draw text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
          Shop Now
        </span>
      </p>
    </Link>
  );
}

export function StyleInMotion() {
  return (
    <section className="w-full">
      <div className="container py-10 sm:py-12 md:py-16">
        <SectionHeading title="Style in Motion" />

        <div className="scrollbar-hide -mx-3 flex snap-x gap-4 overflow-x-auto px-3 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:px-0 lg:gap-6">
          {TILES.map((t, i) => (
            <TileCard key={`${t.label}-${i}`} tile={t} />
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-12 md:mt-16 md:pt-14">
          <h3 className="section-title">Why Choose Kibana</h3>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-3 gap-4 sm:gap-10">
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="group flex flex-col items-center gap-4 text-center">
                <Icon
                  className="h-8 w-8 text-kibana-brown transition-transform duration-500 group-hover:-translate-y-1 sm:h-10 sm:w-10"
                  strokeWidth={1}
                />
                <p className="font-jost text-[11px] uppercase tracking-[0.18em] text-foreground sm:text-[13px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
