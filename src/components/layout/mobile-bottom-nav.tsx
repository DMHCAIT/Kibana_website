"use client";

import Link from "next/link";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/store/cart-store";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex">
              <Link
                href={t.href}
                className="relative flex flex-col items-center justify-center gap-0.5 w-full py-2 text-[10px] text-foreground/70 hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                {t.label}
                {t.href === "/cart" && count > 0 && (
                  <span className="absolute top-1 right-3 inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
