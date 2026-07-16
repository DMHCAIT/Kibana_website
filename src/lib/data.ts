import type { Product, Category } from "@/types/product";
import productsData from "@/data/products.json";

export const products: Product[] = productsData as unknown as Product[];

export const categories: Category[] = [
  { slug: "tote-bag", name: "Tote Bag", image: "/mv/cat-5.jpeg" },
  { slug: "laptop-bag", name: "Laptop Bag", image: "/mv/cat-3.jpeg" },
  { slug: "sling-bag", name: "Sling Bag", image: "/mv/cat-4.jpeg" },
  { slug: "shoulder-bag", name: "Shoulder Bags", image: "/mv/cat-5.jpeg" },
  { slug: "clutch", name: "Clutch", image: "/mv/cat-2.jpeg" },
  { slug: "backpack", name: "Backpack", image: "/mv/cat-1.jpeg" },
  { slug: "wallet", name: "Wallet", image: "/mv/cat-6.jpeg" },
];

export const genderShelves = [
  { slug: "men", name: "MEN", image: "/extracted/img-080.jpg" },
  { slug: "women", name: "WOMEN", image: "/extracted/img-070.jpg" },
  { slug: "unisex", name: "UNISEX", image: "/extracted/img-090.jpg" },
] as const;

export const trustBadges = [
  { icon: "leaf", label: "Eco-Friendly" },
  { icon: "shield", label: "Vegan Leather" },
  { icon: "refresh", label: "Easy Returns" },
] as const;

export const customerReviews = [
  {
    id: "r1",
    name: "Anaya M.",
    avatar: "/mv/Review1.jpg",
    rating: 4.5,
    text: "The stitching and finishing feel premium. Totally worth the price.",
  },
  {
    id: "r2",
    name: "Priya S.",
    avatar: "/mv/Review2.jpg",
    rating: 5,
    text: "My third Kibana bag and the quality keeps improving. Obsessed.",
  },
  {
    id: "r3",
    name: "Sofia R.",
    avatar: "/mv/Review3.jpg",
    rating: 5,
    text: "Perfect for everyday use. The design is minimalist yet elegant.",
  },
  {
    id: "r4",
    name: "Emma K.",
    avatar: "/mv/Review4.jpg",
    rating: 4,
    text: "Love the craftsmanship. Highly recommended for anyone looking for quality.",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}
