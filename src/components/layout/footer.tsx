import Link from "next/link";

import { Facebook, Instagram } from "lucide-react";
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
      <div className="px-5 sm:px-8 md:container py-8 md:py-14">

        {/* Newsletter section */}
        <div className="mb-6 pb-6 border-b border-kibana-cream/10">
          <h3 className="font-bold text-base sm:text-lg md:text-2xl uppercase tracking-[0.15em] mb-3">Get In Touch</h3>
          <NewsletterForm />
        </div>

        {/* Logo + Nav columns */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">

            {/* Logo */}
            <div className="md:flex-shrink-0">
              <Link href="/" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/extracted/kibana logo_white.png"
                  alt="Kibana"
                  className="h-12 sm:h-14 md:h-16 w-auto"
                />
              </Link>
            </div>

            {/* Nav columns — left-aligned, even columns */}
            <div className="flex-1 grid grid-cols-3 gap-6 md:gap-12">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-bold tracking-[0.2em] text-kibana-cream mb-3 uppercase">
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
        <div className="pt-8 border-t border-kibana-cream/10">
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-kibana-cream/70">Follow us</h3>
            <div className="flex items-center gap-7">
              <Link href="#" aria-label="Facebook" className="text-kibana-cream/70 hover:text-kibana-cream transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-kibana-cream/70 hover:text-kibana-cream transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Threads" className="text-kibana-cream/70 hover:text-kibana-cream transition-colors inline-block">
                <svg className="h-5 w-5" viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.205 17.11 97.014 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553ZM98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.754 28.713-23.802 29.274Z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
