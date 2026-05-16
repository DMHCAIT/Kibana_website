"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, Tag, LogOut, ExternalLink,
  Home, Settings, Users, ShoppingCart, ChevronDown, ChevronRight,
  HelpCircle, RotateCcw, Store, Phone, BookOpen,
  TrendingUp, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavChild = { href: string; label: string };
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  children?: NavChild[];
};

type NavGroup = { group: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    group: "Catalog",
    items: [
      {
        href: "/admin/products",
        label: "Products",
        icon: Package,
        children: [
          { href: "/admin/products", label: "All Products" },
          { href: "/admin/products/new", label: "Add New Product" },
        ],
      },
      { href: "/admin/categories", label: "Categories", icon: Tag },
    ],
  },
  {
    group: "Pages & Content",
    items: [
      {
        href: "/admin/homepage",
        label: "Home Page",
        icon: Home,
        children: [
          { href: "/admin/homepage", label: "Section Order & Visibility" },
          { href: "/admin/homepage/products", label: "Section Products" },
          { href: "/admin/homepage/hero", label: "Hero Banner" },
        ],
      },
      { href: "/admin/pages/about", label: "About Us", icon: BookOpen },
      { href: "/admin/pages/contact", label: "Contact Page", icon: Phone },
      { href: "/admin/pages/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/pages/returns", label: "Returns Policy", icon: RotateCcw },
      { href: "/admin/pages/shop", label: "Shop Page", icon: Store },
    ],
  },
  {
    group: "Store",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/users", label: "Customers", icon: Users },
      { href: "/admin/revenue", label: "Revenue", icon: TrendingUp },
      { href: "/admin/analytics", label: "Login Analytics", icon: Activity },
    ],
  },
  {
    group: "Configuration",
    items: [
      { href: "/admin/settings", label: "Theme & Settings", icon: Settings },
    ],
  },
];

function SidebarItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
  const [open, setOpen] = useState(isActive);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors",
            isActive ? "bg-white/15 text-white font-medium" : "text-white/55 hover:text-white hover:bg-white/8"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {open ? <ChevronDown className="h-3 w-3 opacity-60" /> : <ChevronRight className="h-3 w-3 opacity-60" />}
        </button>
        {open && (
          <div className="ml-[2.1rem] mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
            {item.children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "text-xs py-1.5 px-2 rounded transition-colors",
                    childActive ? "text-white font-medium bg-white/10" : "text-white/45 hover:text-white hover:bg-white/8"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive ? "bg-white/15 text-white font-medium" : "text-white/55 hover:text-white hover:bg-white/8"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 text-white flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <Image
          src="/extracted/kibana logo_white.png"
          alt="Kibana"
          width={110}
          height={44}
          className="h-9 w-auto"
        />
        <p className="text-[10px] text-white/40 mt-1.5 tracking-[0.18em] uppercase">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-1.5 text-[9px] font-semibold tracking-[0.2em] uppercase text-white/25">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0 space-y-1">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/8 transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span>View Store</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/55 hover:text-red-300 hover:bg-red-900/20 transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}



