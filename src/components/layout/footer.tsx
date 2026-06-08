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
    links: [
      { label: "our story", href: "/about" },
      { label: "sitemap", href: "/sitemap" },
      { label: "blogs", href: "/blogs" },
    ],
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
    <footer className="bg-kibana-ink text-kibana-cream pb-16 md:pb-0">
      <div className="px-4 sm:px-8 md:container py-6 md:py-8">

        {/* Newsletter section */}
        <div className="mb-6 pb-6 border-b border-kibana-cream/10">
          <h3 className="font-bold text-base sm:text-lg uppercase tracking-[0.15em] mb-4">Get In Touch</h3>
          <NewsletterForm />
        </div>

        {/* Logo + Nav columns */}
        <div className="mb-6">
          <div className="flex flex-col md:grid md:grid-cols-4 md:gap-12 md:items-start md:pt-6">

            {/* Logo */}
            <div className="hidden md:flex md:flex-shrink-0 md:pl-8">
              <Link href="/" className="inline-block flex items-center justify-center">
                <ResponsiveImage src="/extracted/kibana logo_white.png" alt="Kibana" width={160} height={64} className="object-contain h-32 w-auto" />
              </Link>
            </div>

            {/* Nav columns — 3 cols on mobile/tablet, each in own col on desktop */}
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-3 md:contents gap-6 sm:gap-8 md:gap-0 md:mt-0">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-semibold tracking-[0.2em] text-kibana-cream mb-3 uppercase">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-xs text-kibana-cream/70">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="hover:text-kibana-cream transition-colors leading-snug block">
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
        <div className="pt-6 border-t border-kibana-cream/10">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-kibana-cream/70">Follow us</h3>
            <div className="flex items-center gap-8">
              <Link href="https://www.facebook.com/kibanalife" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-kibana-cream/70 hover:text-kibana-cream transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.youtube.com/@KibanaLife" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-kibana-cream/70 hover:text-kibana-cream transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/kibanalifeofficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-kibana-cream/70 hover:text-kibana-cream transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
