export type ShopCategory = {
  slug: string;
  name: string;
  href: string;
  image: string;
};

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    slug: "tote-bag",
    name: "Tote Bags",
    href: "/category/tote",
    image:
      "/kibana_product_images/2 collection/Large Aurelia fan tote/Mocha/02-04-2026--paulina06474_result.webp",
  },
  {
    slug: "shoulder-bag",
    name: "Shoulder Bags",
    href: "/category/shoulder",
    image: "/mv/cat-5.jpeg",
  },
  { slug: "sling-bag", name: "Sling Bags", href: "/category/sling", image: "/mv/cat-4.jpeg" },
  { slug: "duffle-bag", name: "Duffle", href: "/category/duffle", image: "/mv/cat-2.jpeg" },
  { slug: "laptop-bag", name: "Laptop Bags", href: "/category/laptop", image: "/mv/cat-3.jpeg" },
  { slug: "backpack", name: "Backpacks", href: "/category/backpack", image: "/mv/cat-1.jpeg" },
  {
    slug: "clutch",
    name: "Clutch",
    href: "/category/clutch",
    image: "/kibana_product_images/1 collection/Lekha Wallet/Milky Blue/1.webp",
  },
  {
    slug: "wallet",
    name: "Wallets",
    href: "/category/wallet",
    image: "/kibana_product_images/1 collection/Zippy Wallet/mint green/1.webp",
  },
];
