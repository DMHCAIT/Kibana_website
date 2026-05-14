"use client";

import Link from "next/link";
import { Home, Heart, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { useRouter, usePathname } from "next/navigation";

export function MobileBottomNav() {
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleAccount = () => {
    if (!user) { openAuthModal(); } else { router.push("/account"); }
  };

  const handleWishlist = () => {
    if (!user) { openAuthModal(); } else { router.push("/wishlist"); }
  };

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Shop", icon: Search, href: "/shop" },
    { label: "Wishlist", icon: Heart, action: handleWishlist },
    { label: "Cart", icon: ShoppingBag, href: "/cart" },
    { label: "Account", icon: User, action: handleAccount },
  ];

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : false;
          const cls = `relative flex flex-col items-center justify-center gap-0.5 w-full py-2 text-[10px] transition-colors ${
            isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"
          }`;

          return (
            <li key={item.label} className="flex">
              {item.href ? (
                <Link href={item.href} className={cls}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.href === "/cart" && count > 0 && (
                    <span className="absolute top-1 right-2 inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                      {count}
                    </span>
                  )}
                </Link>
              ) : (
                <button onClick={item.action} className={cls}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
