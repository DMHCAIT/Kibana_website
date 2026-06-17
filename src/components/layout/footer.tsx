import Link from "next/link";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

const columns = [
  {
    title: "SHOP",
    links: [
      { label: "Laptop", href: "/shop?cat=laptop-bag" },
      { label: "Wallet", href: "/shop?cat=wallet" },
      { label: "Tote bag", href: "/shop?cat=tote-bag" },
      { label: "Sling bag", href: "/shop?cat=sling-bag" },
      { label: "Backpack", href: "/shop?cat=backpack" },
      { label: "All category", href: "/shop" },
    ],
  },
  {
    title: "ABOUT",
    links: [{ label: "our story", href: "/about" }],
  },
  {
    title: "SUPPORT",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "contact us", href: "/contact" },
      { label: "returns & exchange", href: "/returns" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-kibana-ink pb-16 text-kibana-cream md:pb-0">
      <div className="px-4 py-6 md:container sm:px-8 md:py-7">
        {/* Newsletter section */}
        <div className="mb-6 border-b border-kibana-cream/10 pb-6">
          <h3 className="mb-4 text-lg font-bold uppercase tracking-[0.15em] sm:text-xl">
            Get In Touch
          </h3>
          <NewsletterForm />
        </div>

        {/* Logo + Nav columns */}
        <div className="mb-6">
          <div className="flex flex-col gap-6 md:grid md:grid-cols-[220px_1fr] md:items-start md:gap-10 md:pt-2">
            {/* Logo */}
            <div className="hidden md:flex md:flex-shrink-0">
              <Link href="/" className="inline-flex items-center justify-start">
                <ResponsiveImage
                  src="/extracted/kibana logo_white.webp"
                  alt="Kibana"
                  width={160}
                  height={64}
                  className="h-24 w-auto object-contain lg:h-28"
                />
              </Link>
            </div>

            {/* Nav columns */}
            <div className="grid flex-1 grid-cols-3 gap-5 sm:gap-8 md:grid-cols-3 md:gap-10">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-kibana-cream">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5 text-sm text-kibana-cream/75">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="block leading-snug transition-colors hover:text-kibana-cream"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social row */}
        <div className="border-t border-kibana-cream/10 pt-5">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-kibana-cream/75">
              Follow us
            </h3>
            <div className="flex items-center gap-8">
              <Link
                href="https://www.facebook.com/kibanalife"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-kibana-cream/70 transition-colors hover:text-kibana-cream"
              >
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="https://www.youtube.com/@KibanaLife"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-kibana-cream/70 transition-colors hover:text-kibana-cream"
              >
                <Youtube className="h-6 w-6" />
              </Link>
              <Link
                href="https://www.instagram.com/kibanalifeofficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-kibana-cream/70 transition-colors hover:text-kibana-cream"
              >
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
