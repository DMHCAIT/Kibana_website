import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Tote Bags", href: "/shop?cat=tote-bag" },
      { label: "Laptop Bags", href: "/shop?cat=laptop-bag" },
      { label: "Sling Bags", href: "/shop?cat=sling-bag" },
      { label: "Shoulder Bags", href: "/shop?cat=shoulder-bag" },
      { label: "Backpacks", href: "/shop?cat=backpack" },
      { label: "Wallets", href: "/shop?cat=wallet" },
      { label: "All Products", href: "/shop" },
    ],
  },
  {
    title: "About",
    links: [{ label: "Our Story", href: "/about" }],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Contact Us", href: "/contact" },
      { label: "Returns", href: "/returns" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/kibanalife", icon: Facebook },
  { label: "YouTube", href: "https://www.youtube.com/@KibanaLife", icon: Youtube },
  { label: "Instagram", href: "https://www.instagram.com/kibanalifeofficial/", icon: Instagram },
];

export function Footer() {
  return (
    <footer className="bg-kibana-ink pb-16 text-kibana-cream md:pb-0">
      <div className="container py-6 md:py-8">
        {/* Main content — single compact block */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 lg:grid-cols-[200px_1fr_280px] lg:items-start">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" aria-label="Kibana home" className="transition-opacity hover:opacity-90">
              <span className="font-logo text-2xl font-normal tracking-[0.25em] text-kibana-cream md:text-[1.65rem]">
                KIBANA
              </span>
            </Link>
            <p className="mt-1.5 text-[11px] tracking-[0.14em] text-kibana-cream/50">
              Pure. Minimal. Luxe.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-kibana-tan">
                  {col.title}
                </h4>
                <ul className="space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-kibana-cream/65 transition-colors hover:text-kibana-cream sm:text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2 lg:col-span-1">
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-kibana-tan">
              Newsletter
            </h4>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-kibana-cream/10 pt-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-kibana-cream/50 transition-colors hover:text-kibana-tan"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
          <p className="text-[10px] tracking-wide text-kibana-cream/35">
            © {new Date().getFullYear()} Kibana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
