"use client";

import { MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";

const SITE_URL = "https://www.kibanalife.com";

type Props = {
  product: Product;
  price: number;
  colorSlug?: string;
};

export function WhatsAppShare({ product, price, colorSlug }: Props) {
  const shareToWhatsApp = () => {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || SITE_URL).replace(/\/$/, "");
    const productPath = colorSlug
      ? `/shop/${product.slug}?color=${colorSlug}`
      : `/shop/${product.slug}`;
    const productUrl = `${baseUrl}${productPath}`;
    const description = product.description.replace(/\s+/g, " ").trim();

    const message = [
      "*KIBANA*",
      "*Check out this amazing product!*",
      "",
      `*${product.name}*`,
      `*Price* Rs. ${price.toLocaleString("en-IN")}`,
      `*Description* ${description}`,
      `*View Product* ${productUrl}`,
      "",
      "Shop now on Kibana - Pure. Minimal. Luxe.",
    ].join("\n");

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={shareToWhatsApp}
      className="inline-flex w-full items-center justify-center gap-2 rounded bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
      title="Share on WhatsApp"
    >
      <MessageCircle className="h-4 w-4" />
      Share on WhatsApp
    </button>
  );
}
