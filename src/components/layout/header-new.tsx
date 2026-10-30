"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { cn } from "@/lib/utils";

const DEFAULT_ANNOUNCEMENTS = [
  "100% PREMIUM VEGAN LEATHER",
  "DELIVERY WITHIN 4 DAYS ACROSS INDIA",
  "PAY ONLINE, GET ₹100 OFF AUTOMATICALLY",
  "RATED 4.7★ BY 112 CUSTOMERS",
];
const LEGACY_ANNOUNCEMENT =
  "UPTO 60% OFF ON SELECTED STYLES · 100% PREMIUM VEGAN LEATHER · FREE SHIPPING ON ORDERS ABOVE ₹999";

const secondaryMenu = [
  { label: "Shop All", href: "/shop" },
  { label: "Our Story", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact Us", href: "/contact" },
];

function AnnouncementBar({ text }: { text?: string }) {
  const announcementText = text === LEGACY_ANNOUNCEMENT ? undefined : text;
  const phrases = announcementText
    ? announcementText
        .split("·")
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_ANNOUNCEMENTS;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % phrases.length), 4500);
    return () => window.clearInterval(id);
  }, [phrases.length]);

  const go = (step: number) => setIndex((i) => (i + step + phrases.length) % phrases.length);

  return (
    <div className="bg-kibana-brown text-white">
      <div className="container flex h-9 items-center justify-between">
        <button
          type="button"
          aria-label="Previous announcement"
          onClick={() => go(-1)}
          className="p-1 text-white/80 hover:text-white sm:ml-[8%]"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        <div className="relative h-full flex-1 overflow-hidden">
          {phrases.map((phrase, i) => (
            <p
              key={phrase}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 flex items-center justify-center text-center font-sans text-[10px] font-normal uppercase transition-all duration-700",
                i === index ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
              )}
            >
              {phrase}
            </p>
          ))}
        </div>
        <button
          type="button"
          aria-label="Next announcement"
          onClick={() => go(1)}
          className="p-1 text-white/80 hover:text-white sm:mr-[8%]"
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export function Header({ announcement }: { announcement?: string }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const { user, openAuthModal, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
    setShowSearch(false);
    setShopMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!shopMenuOpen) return;
    const close = () => setShopMenuOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [shopMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setOpen(false);
      setShowSearch(false);
    }
  };

  const iconClass = "text-foreground transition-opacity hover:opacity-60";

  return (
    <>
      <AnnouncementBar text={announcement} />

      <header className="storefront-header sticky top-0 z-40 w-full bg-white">
        <div className="storefront-header-inner container grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: menu */}
          <div className="flex h-full items-center gap-8">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className={cn("lg:hidden", iconClass)}
            >
              <Menu className="h-6 w-6" strokeWidth={1.25} />
            </button>
            <nav aria-label="Main navigation" className="hidden h-full items-center gap-7 lg:flex">
              <Link
                href="/"
                className="link-draw font-jost text-[12px] uppercase tracking-[0.18em] text-foreground"
              >
                Home
              </Link>
              <div
                className="relative flex h-full items-center"
                onMouseEnter={() => setShopMenuOpen(true)}
                onMouseLeave={() => setShopMenuOpen(false)}
                onFocusCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setShopMenuOpen(true);
                }}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setShopMenuOpen(false);
                }}
                onClickCapture={() => setShopMenuOpen(false)}
              >
                <Link
                  href="/shop"
                  aria-expanded={shopMenuOpen}
                  aria-controls="desktop-shop-categories"
                  className="link-draw flex h-full items-center font-jost text-[12px] uppercase tracking-[0.18em] text-foreground"
                >
                  Shop All
                </Link>
                <div
                  id="desktop-shop-categories"
                  className={cn(
                    "absolute left-0 top-full z-50 w-[480px] border border-border bg-white p-6 shadow-xl transition-all duration-200",
                    shopMenuOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0",
                  )}
                >
                  <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {SHOP_CATEGORIES.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={category.href}
                          className="link-draw font-jost text-[12px] uppercase tracking-[0.14em] text-foreground/80"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link
                href="/about"
                className="link-draw font-jost text-[12px] uppercase tracking-[0.18em] text-foreground"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Center: logo */}
          <Link
            href="/"
            aria-label="Kibana home"
            className="font-logo text-[22px] leading-none text-foreground lg:text-[28px]"
          >
            KIBANA
          </Link>

          {/* Right: actions */}
          <div className="flex items-center justify-end gap-5 sm:gap-6">
            <div className="relative hidden md:block">
              {user ? (
                <button
                  aria-label="Account menu"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-foreground text-[11px] font-medium"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
              ) : (
                <button aria-label="Sign in" onClick={() => openAuthModal()} className={iconClass}>
                  <User className="h-[22px] w-[22px]" strokeWidth={1.25} />
                </button>
              )}

              {showUserMenu && user && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-4 w-60 animate-fadeIn border border-border bg-white shadow-xl">
                    <div className="border-b border-border px-5 py-4">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 border-b border-border px-5 py-3 text-xs uppercase tracking-[0.14em] hover:bg-kibana-tile"
                    >
                      <User className="h-4 w-4" strokeWidth={1.25} />
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 border-b border-border px-5 py-3 text-xs uppercase tracking-[0.14em] hover:bg-kibana-tile"
                    >
                      <Package className="h-4 w-4" strokeWidth={1.25} />
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-5 py-3 text-xs uppercase tracking-[0.14em] text-destructive hover:bg-kibana-tile"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.25} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              aria-label="Search"
              aria-expanded={showSearch}
              aria-controls="site-search"
              onClick={() => setShowSearch((visible) => !visible)}
              className={iconClass}
            >
              <Search className="h-[22px] w-[22px]" strokeWidth={1.25} />
            </button>

            <Link
              href={user ? "/wishlist" : "#"}
              aria-label="Wishlist"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal();
                }
              }}
              className={cn("hidden md:block", iconClass)}
            >
              <Heart className="h-[22px] w-[22px]" strokeWidth={1.25} />
            </Link>

            <Link href="/cart" aria-label="Cart" className={cn("relative", iconClass)}>
              <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.25} />
              {count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-kibana-brown px-1 text-[10px] font-medium text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search panel */}
        <div
          className={cn(
            "grid overflow-hidden border-t border-border bg-white transition-all duration-500 ease-out",
            showSearch
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] border-transparent opacity-0",
          )}
        >
          <div className="min-h-0">
            <form
              id="site-search"
              role="search"
              onSubmit={handleSearch}
              className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-6 sm:px-8"
            >
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.25} />
              <input
                autoFocus={showSearch}
                type="search"
                aria-label="Search products"
                placeholder="Search for bags, wallets…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b border-foreground/30 bg-transparent py-2 font-jost text-base tracking-[0.06em] outline-none placeholder:text-muted-foreground focus:border-foreground"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setShowSearch(false)}
                className={iconClass}
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-[visibility] duration-500",
          open ? "visible" : "invisible",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-500",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "ease-[cubic-bezier(0.22,1,0.36,1)] absolute inset-y-0 left-0 flex w-[88%] max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-500",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            <span className="font-logo text-lg">KIBANA</span>
            <button aria-label="Close menu" onClick={() => setOpen(false)} className={iconClass}>
              <X className="h-6 w-6" strokeWidth={1.25} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 pb-8 sm:px-10">
            <p className="eyebrow mb-4 mt-2">Women</p>
            <ul className="space-y-1">
              {SHOP_CATEGORIES.map((c, i) => (
                <li
                  key={c.slug}
                  className={cn(
                    "transition-all duration-500",
                    open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                  )}
                  style={{ transitionDelay: open ? `${120 + i * 40}ms` : "0ms" }}
                >
                  <Link
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between py-2.5 font-jost text-[17px] uppercase tracking-[0.16em] text-foreground"
                  >
                    <span className="link-draw">{c.name}</span>
                    <ChevronRight
                      className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60"
                      strokeWidth={1.25}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-6 h-px bg-border" />

            <ul className="space-y-1">
              {secondaryMenu.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="link-draw inline-block py-2 text-[13px] tracking-[0.04em] text-foreground/80"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-border px-6 py-5 sm:px-10">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b border-foreground/30 bg-transparent py-2 pr-8 text-sm outline-none focus:border-foreground"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-0 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4" strokeWidth={1.25} />
              </button>
            </form>
            {!user && (
              <button
                onClick={() => {
                  openAuthModal();
                  setOpen(false);
                }}
                className="btn-pill w-full"
              >
                Sign In
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
