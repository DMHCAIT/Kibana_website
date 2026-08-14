"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Package,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const mainMenu = [
  {
    label: "Women Bags",
    submenu: [
      { label: "Tote Bags", href: "/shop?cat=tote-bag" },
      { label: "Laptop Bags", href: "/shop?cat=laptop-bag" },
      { label: "Sling Bags", href: "/shop?cat=sling-bag" },
      { label: "Shoulder Bags", href: "/shop?cat=shoulder-bag" },
      { label: "Backpacks", href: "/shop?cat=backpack" },
      { label: "Clutch", href: "/shop?cat=clutch" },
      { label: "Wallets", href: "/shop?cat=wallet" },
    ],
  },
  {
    label: "Men Bags",
    submenu: [
      { label: "Tote Bags", href: "/shop?cat=tote-bag" },
      { label: "Laptop Bags", href: "/shop?cat=laptop-bag" },
      { label: "Sling Bags", href: "/shop?cat=sling-bag" },
      { label: "Shoulder Bags", href: "/shop?cat=shoulder-bag" },
      { label: "Backpacks", href: "/shop?cat=backpack" },
      { label: "Clutch", href: "/shop?cat=clutch" },
      { label: "Wallets", href: "/shop?cat=wallet" },
    ],
  },
  { label: "All Products", submenu: null },
];

const desktopNav = [
  { label: "Shop", href: "/shop" },
  { label: "Tote Bags", href: "/shop?cat=tote-bag" },
  { label: "Laptop Bags", href: "/shop?cat=laptop-bag" },
  { label: "Sling Bags", href: "/shop?cat=sling-bag" },
  { label: "Shoulder Bags", href: "/shop?cat=shoulder-bag" },
  { label: "Backpacks", href: "/shop?cat=backpack" },
  { label: "Clutch", href: "/shop?cat=clutch" },
  { label: "Wallets", href: "/shop?cat=wallet" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const { user, openAuthModal, logout } = useAuth();

  const handleSubmenuOpen = (menuLabel: string) => {
    setActiveSubmenu(menuLabel);
  };

  const handleBackClick = () => {
    setActiveSubmenu(null);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setOpen(false);
      setShowMobileSearch(false);
    }
  };

  const currentSubmenu = activeSubmenu
    ? mainMenu.find((m) => m.label === activeSubmenu)?.submenu
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background">
      <div className="container relative flex h-14 items-center gap-3 py-2 sm:h-16 sm:gap-4 sm:py-3 md:h-20 md:gap-5 md:py-4 lg:h-20 lg:gap-5 lg:py-4">
        {/* Menu button — hidden on large screens */}
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="-ml-2 p-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo: bold KIBANA wordmark */}
        <Link
          href="/"
          aria-label="Kibana home"
          className="absolute left-1/2 flex flex-shrink-0 -translate-x-1/2 items-center justify-center md:relative md:left-auto md:translate-x-0"
        >
          <span className="font-logo text-base font-normal tracking-[0.25em] text-foreground sm:text-lg md:text-2xl lg:text-2xl">
            KIBANA
          </span>
        </Link>

        {/* Desktop navigation — visible from large screens */}
        <nav className="ml-2 hidden items-center gap-2 whitespace-nowrap text-xs font-medium uppercase tracking-[0.1em] md:flex md:gap-5">
          {desktopNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search bar — only on extra large screens */}
        <div className="ml-auto hidden flex-shrink-0 lg:flex lg:max-w-sm">
          <form onSubmit={handleSearch} className="relative w-full min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 flex-shrink-0 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for bags, wallets…"
              className="w-full truncate bg-muted/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right side icons */}
        <div
          className={cn("flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-3", "ml-auto lg:ml-0")}
        >
          {/* Account — visible from medium screens (sm and above) */}
          <div className="relative hidden sm:block">
            {user ? (
              <button
                aria-label="Account menu"
                onClick={() => setShowUserMenu((v) => !v)}
                className="relative inline-flex h-10 w-10 items-center justify-center transition-colors hover:bg-accent/10"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </button>
            ) : (
              <button
                aria-label="Login"
                onClick={() => openAuthModal()}
                className="relative inline-flex h-10 w-10 items-center justify-center transition-colors hover:bg-accent/10"
              >
                <User className="h-5 w-5" />
              </button>
            )}
            {showUserMenu && user && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-border bg-white shadow-lg">
                  <div className="border-b border-border px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-2 border-b border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Wishlist — visible from medium screens (sm and above) */}
          <Link
            href={user ? "/wishlist" : "#"}
            aria-label="Wishlist"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                openAuthModal();
              }
            }}
            className="relative hidden h-10 w-10 items-center justify-center transition-colors hover:bg-accent/10 sm:inline-flex"
          >
            <Heart className="h-5 w-5" />
          </Link>

          {/* Desktop Cart — visible from medium screens (sm and above) */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative hidden h-10 w-10 items-center justify-center transition-colors hover:bg-accent/10 sm:inline-flex"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search bar — hidden */}
      {false && (
        <div className="border-b border-border/40 bg-background lg:hidden">
          <div className="container py-2.5">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search for bags, wallets…"
                className="h-9 w-full bg-muted/40 pl-9 pr-3 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-background p-5 pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              {activeSubmenu && (
                <button onClick={handleBackClick} className="flex items-center gap-1 text-sm">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {!activeSubmenu && <span className="font-logo tracking-[0.25em]">KIBANA</span>}
              {activeSubmenu && (
                <span className="font-logo text-sm tracking-[0.15em]">{activeSubmenu}</span>
              )}
              <button
                aria-label="Close menu"
                onClick={() => {
                  setOpen(false);
                  setActiveSubmenu(null);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto uppercase tracking-[0.1em]">
              {!activeSubmenu
                ? // Main menu
                  mainMenu.map((item) => (
                    <div key={item.label}>
                      {item.submenu ? (
                        <button
                          onClick={() => handleSubmenuOpen(item.label)}
                          className="-mx-2 flex w-full items-center justify-between border-b border-border/60 px-2 py-2 text-sm hover:bg-muted/50"
                        >
                          <span
                            className={
                              item.label === "All Products" ? "normal-case tracking-[0.1em]" : ""
                            }
                          >
                            {item.label}
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <Link
                          href="/shop"
                          className="block border-b border-border/60 py-2 text-sm"
                          onClick={() => setOpen(false)}
                        >
                          <span
                            className={
                              item.label === "All Products" ? "normal-case tracking-[0.1em]" : ""
                            }
                          >
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </div>
                  ))
                : // Submenu
                  currentSubmenu?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="-mx-2 border-b border-border/60 bg-muted/30 px-2 py-2 text-sm hover:bg-muted/60"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
            </nav>
            <div className="mt-3 border-t border-border/60 pt-4">
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block rounded border border-border px-3 py-2 text-sm hover:bg-muted/50"
                >
                  My Account
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      openAuthModal();
                    }}
                    className="w-full rounded border border-kibana-ink bg-kibana-ink px-3 py-2 text-center text-sm text-white hover:bg-black"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      openAuthModal("Sign up to create your Kibana account.");
                    }}
                    className="w-full rounded border border-kibana-ink bg-kibana-ink px-3 py-2 text-center text-sm text-white hover:bg-black"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
