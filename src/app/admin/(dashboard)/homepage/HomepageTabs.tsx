"use client";

import { useState } from "react";
import { LayoutDashboard, Image as ImageIcon, Layers, ShoppingBag, Hammer } from "lucide-react";
import { HomepageManager } from "@/components/admin/homepage-manager";
import { SectionProductsManager } from "@/components/admin/section-products-manager";
import {
  HeroEditor,
  BestSellersEditor,
  CraftsmanshipEditor,
} from "@/components/admin/section-content-editor";
import type { Product } from "@/types/product";

type Section   = { id: string; label: string; visible: boolean; order: number };
type SiteConfig = {
  hero: { title: string; subtitle: string; ctaLabel: string; ctaHref: string; images: string[] };
  sections: Section[];
  sectionProducts: Record<string, string[]>;
  sectionContent?: {
    bestSellers?: { leftImage?: string; rightImage?: string; heading?: string; buttonText?: string; productSlug?: string };
    craftsmanship?: { image?: string; text?: string };
  };
};

const TABS = [
  { id: "layout",         label: "Layout & Order",    icon: LayoutDashboard },
  { id: "hero",           label: "Hero Banner",        icon: ImageIcon },
  { id: "best-sellers",   label: "Best Sellers",       icon: ShoppingBag },
  { id: "craftsmanship",  label: "Craftsmanship",      icon: Hammer },
  { id: "products",       label: "Section Products",   icon: Layers },
] as const;

type TabId = typeof TABS[number]["id"];

export function HomepageTabs({
  config,
  allProducts,
}: {
  config: SiteConfig;
  allProducts: Product[];
}) {
  const [tab, setTab] = useState<TabId>("layout");

  const bs = config.sectionContent?.bestSellers;
  const cf = config.sectionContent?.craftsmanship;

  return (
    <div className="flex flex-col h-full">
      {/* Tab nav */}
      <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 bg-white flex-shrink-0 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-gray-900 text-gray-900 bg-gray-50"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "layout" && (
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">Toggle visibility and reorder sections on the homepage.</p>
            <HomepageManager initialSections={config.sections} />
          </div>
        )}

        {tab === "hero" && (
          <HeroEditor
            initialData={{
              title:    config.hero.title    ?? "",
              subtitle: config.hero.subtitle ?? "",
              ctaLabel: config.hero.ctaLabel ?? "Shop Now",
              ctaHref:  config.hero.ctaHref  ?? "/shop",
              images:   config.hero.images   ?? [],
            }}
          />
        )}

        {tab === "best-sellers" && (
          <BestSellersEditor
            initialData={{
              leftImage:   bs?.leftImage   ?? "/extracted/backpack-left.png",
              rightImage:  bs?.rightImage  ?? "/extracted/backpack-right.png",
              heading:     bs?.heading     ?? "GOT YOUR BACK",
              buttonText:  bs?.buttonText  ?? "SHOP NOW",
              productSlug: bs?.productSlug ?? "north-backpack",
            }}
          />
        )}

        {tab === "craftsmanship" && (
          <CraftsmanshipEditor
            initialData={{
              image: cf?.image ?? "/extracted/craftmanship.png",
              text:  cf?.text  ?? "Craftsmanship",
            }}
          />
        )}

        {tab === "products" && (
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              Pin specific products to each homepage section. Pinned products override the automatic tag-based selection.
            </p>
            <SectionProductsManager
              allProducts={allProducts}
              initialAssignments={config.sectionProducts ?? {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
