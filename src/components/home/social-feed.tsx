import Image from "@/components/ui/image";
import { Instagram, Facebook, Youtube } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/kibanalifeofficial/";

const INSTAGRAM_FEED = [
  "/mv/new-1.jpg",
  "/mv/new-2.jpg",
  "/mv/Trend1.webp",
  "/mv/new-3.jpg",
  "/mv/new-4.jpg",
  "/mv/Trend3.webp",
].map((image, i) => ({ id: i + 1, image, alt: `Instagram Post ${i + 1}`, href: INSTAGRAM_URL }));

const SOCIALS = [
  { href: INSTAGRAM_URL, label: "Follow on Instagram", icon: Instagram },
  { href: "https://www.facebook.com/kibanalife", label: "Follow on Facebook", icon: Facebook },
  { href: "https://www.youtube.com/@KibanaLife", label: "Follow on YouTube", icon: Youtube },
];

export function SocialFeed() {
  return (
    <section className="w-full">
      <div className="container py-10 sm:py-12 md:py-16">
        <p className="eyebrow mb-3 text-center">JOIN THE COMMUNITY</p>
        <h2 className="section-title">Follow the KIBANA World</h2>

        <div className="mb-8 mt-5 flex justify-center gap-3 md:mb-10">
          {SOCIALS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 text-foreground transition-colors duration-300 hover:border-kibana-brown hover:bg-kibana-brown hover:text-white"
            >
              <Icon className="h-4 w-4" strokeWidth={1.4} />
            </a>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:grid-cols-6">
          {INSTAGRAM_FEED.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-kibana-tile"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                sizes="(max-width: 1024px) 33vw, 17vw"
                className="duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] object-cover transition-transform group-hover:scale-[1.08]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-kibana-brown/0 transition-colors duration-500 group-hover:bg-kibana-brown/40">
                <Instagram
                  className="h-7 w-7 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  strokeWidth={1.2}
                />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-pill">
            View More on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
