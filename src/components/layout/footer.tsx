import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";

const columns = [
  {
    title: "Shop",
    links: [
      ...SHOP_CATEGORIES.map((c) => ({ label: c.name, href: c.href })),
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
    <footer className="bg-white text-foreground">
      <div className="border-y border-border bg-kibana-tile">
        <div className="storefront-section-space container text-center">
          <h2 className="section-title">Join Our Newsletter</h2>
          <p className="mx-auto mb-7 mt-3 max-w-md text-[13px] text-muted-foreground">
            Pure. Minimal. Luxe.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="storefront-section-space container">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-logo text-[22px] text-foreground">
              KIBANA
            </Link>
            <p className="mt-3 text-[13px] text-muted-foreground">Pure. Minimal. Luxe.</p>
            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/20 text-foreground transition-colors duration-300 hover:border-kibana-brown hover:bg-kibana-brown hover:text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.4} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-5 font-jost text-[13px] font-medium uppercase tracking-[0.2em] text-foreground">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-draw text-[13px] text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <p className="container py-5 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          © {new Date().getFullYear()} Kibana. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
