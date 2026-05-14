"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronRight, ChevronLeft, LogOut } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const mainMenu = [
  { label: "Shop", submenu: null },
  { 
    label: "Women Bags", 
    submenu: [
      { label: "Tote Bags", href: "/shop?cat=tote-bag&gender=women" },
      { label: "Laptop Bags", href: "/shop?cat=laptop-bag&gender=women" },
      { label: "Sling Bags", href: "/shop?cat=sling-bag&gender=women" },
      { label: "Backpacks", href: "/shop?cat=backpack&gender=women" },
      { label: "Wallets", href: "/shop?cat=wallet&gender=women" },
    ]
  },
  { 
    label: "Men Bags", 
    submenu: [
      { label: "Tote Bags", href: "/shop?cat=tote-bag&gender=men" },
      { label: "Laptop Bags", href: "/shop?cat=laptop-bag&gender=men" },
      { label: "Sling Bags", href: "/shop?cat=sling-bag&gender=men" },
      { label: "Backpacks", href: "/shop?cat=backpack&gender=men" },
      { label: "Wallets", href: "/shop?cat=wallet&gender=men" },
    ]
  },
];

const desktopNav = [
  { label: "Shop", href: "/shop" },
  { label: "Tote Bags", href: "/shop?cat=tote-bag" },
  { label: "Laptop Bags", href: "/shop?cat=laptop-bag" },
  { label: "Sling Bags", href: "/shop?cat=sling-bag" },
  { label: "Backpacks", href: "/shop?cat=backpack" },
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
    ? mainMenu.find(m => m.label === activeSubmenu)?.submenu 
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      {/* Announcement Banner */}
      <div className="w-full bg-black text-white overflow-hidden py-2">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="flex items-center gap-0 shrink-0">
              <span className="text-[11px] font-medium tracking-widest uppercase px-6">FREE RETURNS ON ALL ORDERS</span>
              <span className="text-[#c9a96e]">◆</span>
              <span className="text-[11px] font-medium tracking-widest uppercase px-6">100% PREMIUM VEGAN LEATHER — CRUELTY FREE</span>
              <span className="text-[#c9a96e]">◆</span>
              <span className="text-[11px] font-medium tracking-widest uppercase px-6">HAND-FINISHED. EVERY PIECE. EVERY TIME.</span>
              <span className="text-[#c9a96e]">◆</span>
              <span className="text-[11px] font-medium tracking-widest uppercase px-6">FREE SHIPPING ON ORDERS ABOVE ₹999</span>
              <span className="text-[#c9a96e]">◆</span>
            </span>
          ))}
        </div>
      </div>
      <div className="container relative flex h-14 items-center gap-3 md:h-16 lg:h-18">
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden -ml-2 p-2"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile: centered logo image */}
        <Link href="/" className="md:hidden absolute left-1/2 -translate-x-1/2">
          <Image
            src="/extracted/kibana logo black.png"
            alt="Kibana"
            width={200}
            height={80}
            className="h-16 w-auto"
          />
        </Link>
        {/* Desktop: logo */}
        <Link href="/" className="hidden md:flex items-center">
          <Image
            src="/extracted/kibana logo black.png"
            alt="Kibana"
            width={280}
            height={112}
            className="md:h-24 w-auto"
          />
        </Link>

        <nav className="ml-8 hidden md:flex items-center gap-6 text-sm">
          {desktopNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex ml-auto max-w-sm w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for bags, wallets…" 
              className="pl-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className={cn("flex items-center gap-1 md:gap-2", "ml-auto md:ml-3")}>

          {/* Search icon — mobile only */}
          <button
            aria-label="Search"
            onClick={() => setShowMobileSearch((v) => !v)}
            className="relative md:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center hover:bg-accent/20 transition-colors"
          >
            {showMobileSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          {/* Mobile cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative md:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center hover:bg-accent/20"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          {/* Account — desktop */}
          <div className="relative hidden md:block">
            {user ? (
              <button
                aria-label="Account menu"
                onClick={() => setShowUserMenu((v) => !v)}
                className="relative inline-flex h-10 w-10 items-center justify-center hover:bg-accent/20 transition-colors"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </button>
            ) : (
              <button
                aria-label="Login"
                onClick={() => openAuthModal()}
                className="relative inline-flex h-10 w-10 items-center justify-center hover:bg-accent/20 transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
            )}
            {showUserMenu && user && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border shadow-lg z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                </div>
                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Wishlist — desktop only */}
          <Link
            href={user ? "/wishlist" : "#"}
            aria-label="Wishlist"
            onClick={(e) => { if (!user) { e.preventDefault(); openAuthModal(); } }}
            className="relative hidden md:inline-flex h-10 w-10 items-center justify-center hover:bg-accent/20 transition-colors"
          >
            <Heart className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative hidden md:inline-flex h-10 w-10 items-center justify-center hover:bg-accent/20"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search bar — slides in below header */}
      {showMobileSearch && (
        <div className="md:hidden border-b border-border bg-background">
          <div className="container py-2.5">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search for bags, wallets…"
                className="pl-9 h-9 bg-muted/60"
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
          className="fixed inset-0 z-50 bg-foreground/40 md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-background p-5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              {activeSubmenu && (
                <button 
                  onClick={handleBackClick}
                  className="flex items-center gap-1 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {!activeSubmenu && (
                <span className="font-display tracking-[0.25em]">KIBANA</span>
              )}
              {activeSubmenu && (
                <span className="font-display tracking-[0.15em] text-sm">{activeSubmenu}</span>
              )}
              <button aria-label="Close menu" onClick={() => {
                setOpen(false);
                setActiveSubmenu(null);
              }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
              {!activeSubmenu ? (
                // Main menu
                mainMenu.map((item) => (
                  <div key={item.label}>
                    {item.submenu ? (
                      <button
                        onClick={() => handleSubmenuOpen(item.label)}
                        className="w-full flex items-center justify-between py-2 text-sm border-b border-border/60 hover:bg-muted/50 px-2 -mx-2"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <Link
                        href="/shop"
                        className="py-2 text-sm border-b border-border/60 block"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                // Submenu
                currentSubmenu?.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2 text-sm border-b border-border/60 bg-muted/30 px-2 -mx-2 hover:bg-muted/60"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))
              )}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
